import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { calculateAgeMonths, formatAge } from '@/lib/utils'
import ChildrenList from './ChildrenList'

export const metadata: Metadata = {
  title: 'My Children',
}

export default async function ChildrenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user!.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-black text-stone-900">My Children</h1>
        <Link
          href="/children/new"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md text-sm"
        >
          + Add Child
        </Link>
      </div>

      {children && children.length > 0 ? (
        <ChildrenList children={children} />
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">No children yet</h2>
          <p className="text-stone-500 mb-8">Add a child profile to start their learning journey.</p>
          <Link href="/children/new" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md">
            Add First Child
          </Link>
        </div>
      )}
    </div>
  )
}
