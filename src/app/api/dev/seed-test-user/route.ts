import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Only allow in development
export async function POST() {
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase admin keys' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: 'e2e_test@example.com',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { full_name: 'E2E Test User' }
  })

  if (error && error.message.includes('already exists')) {
    return NextResponse.json({ message: 'User already exists' })
  }
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Test user created successfully' })
}
