import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'
import AILearningSummary from './AILearningSummary'

export const metadata: Metadata = {
  title: 'My Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-6">My Profile</h1>
      <ProfileClient
        profile={profile}
        email={user!.email || ''}
        createdAt={user!.created_at || ''}
      />
      <AILearningSummary parentId={user!.id} />
    </div>
  )
}
