
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
            Your AI Coach
          </h1>
          <p className="text-stone-500 text-sm sm:text-base">
            Ask questions about your child&apos;s development, get activity ideas, or seek parenting advice.
          </p>
        </div>
        
        <div className="bg-amber-100 text-amber-800 font-bold px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-amber-200">
          <span>?</span>
          <span>{credits} AI Credits</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        <CoachClient childrenList={children || []} />
      </div>
    </div>
  )
}
