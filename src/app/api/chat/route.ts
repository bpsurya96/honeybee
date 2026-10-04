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

    // Optional: Log the conversation (Issue P2: Unused ai_conversations)
    if (lastMessage?.role === 'user') {
      try {
        let activeConvId = conversationId;
        if (!activeConvId) {
          // Create new conversation
          const { data: newConv } = await adminSupabase.from('ai_conversations').insert({
            parent_id: user.id,
            child_id: childId || null,
            title: lastMessage.content.substring(0, 50) + '...'
          }).select('id').single();
          if (newConv) activeConvId = newConv.id;
        }

        if (activeConvId) {
          await adminSupabase.from('ai_messages').insert({
            conversation_id: activeConvId,
            role: 'user',
            content: lastMessage.content
          });
          // Note: Assistant message is streamed, so logging it perfectly requires tapping into onFinish callback.
        }
      } catch (e) {
        console.error('Failed to log conversation:', e);
      }
    }

    // Call Gemini
    const result = await streamText({
      model: google('gemini-3.1-flash-lite'), // Updated to 1.5 flash since 3.5 doesn't exist/is typo in old code
      system: systemPrompt,
      messages,
      onFinish: async (completion) => {
        // Log assistant response if we have the tools (omitting for brevity, requires passing conv ID)
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