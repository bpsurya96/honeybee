
import { streamText, Message } from 'ai'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, childId } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response('Gemini API key is missing. Please add GEMINI_API_KEY to your .env.local file.', { status: 500 })
    }

    // Fetch parent profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Fetch child context if provided, else all children
    let childrenQuery = supabase.from('children').select('id, name, date_of_birth').eq('parent_id', user.id)
    if (childId) {
      childrenQuery = childrenQuery.eq('id', childId)
    }
    const { data: children } = await childrenQuery

    // Build the system prompt
    let systemPrompt = `You are the HoneyBee Learning AI Coach, an expert in early childhood development (0-5 years).
You are talking to a parent named ${profile?.full_name || 'there'}. You are supportive, encouraging, and provide evidence-based advice in a warm tone.`

    if (children && children.length > 0) {
      systemPrompt += `\n\nThe parent has the following children:\n`
      children.forEach(child => {
        // Calculate age
        const dob = new Date(child.date_of_birth)
        const today = new Date()
        const months = (today.getFullYear() - dob.getFullYear()) * 12 + today.getMonth() - dob.getMonth()
        const years = Math.floor(months / 12)
        const remMonths = months % 12
        const ageStr = years > 0 ? `${years} years and ${remMonths} months` : `${months} months`
        
        systemPrompt += `- ${child.name}, age ${ageStr} (DOB: ${child.date_of_birth})\n`
      })
      systemPrompt += `\nUse this context to personalise your advice. If they ask for activities, suggest age-appropriate things they can do with household items.`
    } else {
      systemPrompt += `\n\nThe parent hasn't added any children yet. Encourage them to add their child's profile to get personalised learning recommendations.`
    }

    // Call Gemini
    const result = await streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
