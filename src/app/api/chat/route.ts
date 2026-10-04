import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, childId, conversationId } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        'Gemini API key is missing. Please add GEMINI_API_KEY to your .env.local file.',
        { status: 500 }
      )
    }

    const adminSupabase = await createAdminClient();

    // 1. Check and deduct AI Credit
    // We deduct 1 credit per user message. 
    // Usually the last message is the user's new message.
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      const { data: creditAccount } = await adminSupabase
        .from('ai_credit_accounts')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!creditAccount || creditAccount.balance < 1) {
        return new Response('Insufficient AI Credits', { status: 402 });
      }

      // Deduct credit
      // Generate idempotency key based on message count to prevent double deduction on retry
      const idemKey = `chat-${user.id}-${messages.length}-${Date.now()}`;
      const { error: deductError } = await adminSupabase.rpc('deduct_ai_credits', {
        p_parent_id: user.id,
        p_amount: 1,
        p_description: 'Chat Assistant Query',
        p_idem_key: idemKey
      });

      if (deductError) {
        console.error('Credit deduction failed:', deductError);
        return new Response('Failed to deduct credit', { status: 500 });
      }
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    // Fetch parent profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Fetch child context
    let childrenQuery = supabase
      .from('children')
      .select(`
        id, 
        name, 
        date_of_birth,
        child_products (
          order_items (
            product_name
          )
        )
      `)
      .eq('parent_id', user.id)

    if (childId) {
      childrenQuery = childrenQuery.eq('id', childId)
    }

    const { data: children } = await childrenQuery

    // Build system prompt
    let systemPrompt = `You are the HoneyBee Learning AI Coach, an expert in early childhood development (0-5 years).
You are talking to a parent named ${profile?.full_name || 'there'}.
You are supportive, encouraging, and provide evidence-based advice in a warm tone.`

    if (children && children.length > 0) {
      systemPrompt += `\n\nThe parent has the following children:\n`

      children.forEach((child) => {
        const dob = new Date(child.date_of_birth)
        const today = new Date()

        const months =
          (today.getFullYear() - dob.getFullYear()) * 12 +
          today.getMonth() -
          dob.getMonth()

        const years = Math.floor(months / 12)
        const remMonths = months % 12

        const ageStr =
          years > 0
            ? `${years} years and ${remMonths} months`
            : `${months} months`

        systemPrompt += `- ${child.name}, age ${ageStr} (DOB: ${child.date_of_birth})\n`
        
        const products = (child.child_products || [])
          .map((cp: any) => cp.order_items?.product_name)
          .filter(Boolean);
          
        if (products.length > 0) {
          systemPrompt += `  Active Books/Kits: ${products.join(', ')}\n`
        }
      })

      systemPrompt += `
Use this context to personalise your advice.
If they ask for activities, suggest age-appropriate things they can do with household items.`
    } else {
      systemPrompt += `
The parent hasn't added any children yet.
Encourage them to add their child's profile to get personalised learning recommendations.`
    }

    // Fetch active products to allow the AI to make recommendations
    const { data: allProducts } = await supabase
      .from('products')
      .select('name, age_min, age_max, description')
      .eq('status', 'active');
      
    if (allProducts && allProducts.length > 0) {
      systemPrompt += `\n\nHere is the current HoneyBee Learning product catalog. If appropriate, you may gently recommend a product that fits the child's age and developmental needs based on their questions:\n`;
      allProducts.forEach(p => {
        systemPrompt += `- ${p.name} (Ages ${p.age_min}-${p.age_max} months): ${p.description}\n`;
      });
    }

    // Setup robust conversation & message logging
    let activeConvId = conversationId;
    
    if (lastMessage?.role === 'user' && activeConvId) {
      try {
        // Check if conversation exists, if not create it
        const { data: existing } = await adminSupabase.from('ai_conversations').select('id').eq('id', activeConvId).single();
        if (!existing) {
          await adminSupabase.from('ai_conversations').insert({
            id: activeConvId,
            parent_id: user.id,
            child_id: childId || null,
            title: lastMessage.content.substring(0, 50) + '...'
          });
        }
        
        // Log User message
        await adminSupabase.from('ai_messages').insert({
          conversation_id: activeConvId,
          role: 'user',
          content: lastMessage.content
        });
      } catch (e) {
        console.error('Failed to log user message:', e);
      }
    }

    const startTime = Date.now();

    // Call Gemini
    const result = await streamText({
      model: google('gemini-3.1-flash-lite'), // Note: the literal model string
      system: systemPrompt,
      messages,
      onFinish: async (completion) => {
        if (!activeConvId) return;
        try {
          // 1. Log AI Message
          await adminSupabase.from('ai_messages').insert({
            conversation_id: activeConvId,
            role: 'assistant',
            content: completion.text,
            tokens_used: completion.usage?.totalTokens || 0
          });
          
          // 2. Log Usage 
          await adminSupabase.from('ai_usage_log').insert({
            parent_id: user.id,
            conversation_id: activeConvId,
            model: 'gemini-3.1-flash-lite',
            input_tokens: (completion.usage as any)?.promptTokens || 0,
            output_tokens: (completion.usage as any)?.completionTokens || 0,
            latency_ms: Date.now() - startTime,
            success: true,
            credit_deducted: 1
          });
        } catch (e) {
          console.error('Failed to log assistant message & usage:', e);
        }
      }
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Internal Server Error', {
      status: 500,
    })
  }
}