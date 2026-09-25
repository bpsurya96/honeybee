import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatAge, calculateAgeMonths } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch parent profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fetch children
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user!.id)
    .order('created_at', { ascending: true })

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-stone-900">
          Hello, {firstName}! ??
        </h1>
        <p className="text-stone-500 mt-1">
          Here&apos;s your family&apos;s learning overview.
        </p>
      </div>

      {/* Children Section */}
      {children && children.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-stone-800">
              My Children
            </h2>
            <Link
              href="/children/new"
              className="text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors"
            >
              + Add child
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((child) => {
              const ageMonths = calculateAgeMonths(child.date_of_birth)
              const ageDisplay = formatAge(ageMonths)
              return (
                <Link
                  key={child.id}
                  href={`/children/${child.id}`}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl font-display font-black text-amber-600">
                      {child.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg text-stone-900">
                        {child.name}
                      </p>
                      <p className="text-stone-500 text-sm">{ageDisplay}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Learning progress</span>
                      <span>0%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">
            Add your first child
          </h2>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto">
            Start your family&apos;s personalised learning journey by adding a
            child profile.
          </p>
          <Link
            href="/children/new"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            <span>Add First Child</span>
            <span>?</span>
          </Link>
        </div>
      )}
    </div>
  )
}
