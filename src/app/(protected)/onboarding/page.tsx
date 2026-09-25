import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingFlow from './OnboardingFlow'

export const metadata: Metadata = {
  title: 'Welcome to HoneyBee Learning',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If parent already has children, skip onboarding
  const { data: children, count } = await supabase
    .from('children')
    .select('id', { count: 'exact' })
    .eq('parent_id', user.id)
    .limit(1)

  if (count && count > 0) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return <OnboardingFlow firstName={profile?.full_name?.split(' ')[0] || 'there'} />
}
