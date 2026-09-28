import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { child_id, message, conversation_id } = body;

    if (!child_id || !message) {
      return NextResponse.json({ error: 'child_id and message are required' }, { status: 400 });
    }

    // 1. Check AI Credits
    const { data: profile } = await supabase.from('profiles').select('ai_credits').eq('id', user.id).single();
    if (!profile || (profile.ai_credits || 0) < 1) {
      return NextResponse.json({ error: 'Insufficient AI credits. Please purchase more books to earn credits.' }, { status: 403 });
    }

    let convId = conversation_id;

    // 2. Create Conversation if needed
    if (!convId) {
      const { data: conv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          parent_id: user.id,
          child_id: child_id,
          title: message.substring(0, 40) + '...'
        })
        .select('id')
        .single();
      
      if (convError || !conv) throw convError;
      convId = conv.id;
    }

    // 3. Save User Message
    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message
    });

    // 4. Fetch Context (Child's age and progress)
    const { data: child } = await supabase.from('children').select('name, date_of_birth').eq('id', child_id).single();
    
    // 5. Generate Mock AI Response based on context
    // In a real app, this is where we'd call OpenAI with the child's progress as system prompt
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking
    
    const childName = child?.name || 'your child';
    let aiReply = `That's a great question about ${childName}! `;
    
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('reading') || lowerMsg.includes('literacy')) {
      aiReply += `At this age, introducing phonics through playful sounds is very effective. I see ${childName} has some Language & Literacy activities in their library. Try focusing on the "Sound Match" game for 10 minutes today!`;
    } else if (lowerMsg.includes('sleep') || lowerMsg.includes('bed')) {
      aiReply += `Establishing a consistent bedtime routine is crucial. Try replacing screen time with a quiet sensory activity or a storybook about 30 minutes before bed.`;
    } else if (lowerMsg.includes('tantrum') || lowerMsg.includes('crying')) {
      aiReply += `Tantrums are a normal part of emotional development. When ${childName} is upset, try to stay calm, acknowledge their feelings ("I see you're angry"), and offer a comforting sensory activity once they settle.`;
    } else {
      aiReply += `Based on their current developmental stage, I recommend focusing on consistent, short bursts of play. Have you checked out the new Cognitive activities in their library?`;
    }

    // 6. Save AI Message
    const { data: aiMsg } = await supabase.from('ai_messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: aiReply
    }).select('id, content, created_at, role').single();

    // 7. Deduct 1 Credit
    await supabase.from('ai_credit_transactions').insert({
      parent_id: user.id,
      amount: -1.00,
      reason: 'AI Coach Session',
      status: 'completed'
    });

    return NextResponse.json({ 
      conversation_id: convId,
      message: aiMsg,
      credits_remaining: (profile.ai_credits || 0) - 1
    });

  } catch (err: any) {
    console.error('AI Coach error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
