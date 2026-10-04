
import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoachClient from './CoachClient'

export const metadata: Metadata = {
  title: 'AI Coach | HoneyBee Learning',
}

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: children } = await supabase
    .from('children')
    .select('id, name')
    .eq('parent_id', user.id)

  const adminSupabase = await createAdminClient()
  const { data: creditAccount } = await adminSupabase
    .from('ai_credit_accounts')
    .select('balance')
    .eq('id', user.id)
    .single()
    
  const credits = creditAccount?.balance || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      

      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        <CoachClient childrenList={children || []} initialCredits={credits} />
      </div>
    </div>
  )
}
