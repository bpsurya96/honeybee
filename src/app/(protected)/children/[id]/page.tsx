import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatAge, calculateAgeMonths } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: child } = await supabase
    .from('children')
    .select('name')
    .eq('id', id)
    .single()
  return { title: child?.name || 'Child Dashboard' }
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .eq('parent_id', user.id)
    .single()

  if (!child) notFound()

  const ageMonths = calculateAgeMonths(child.date_of_birth)
  const ageDisplay = formatAge(ageMonths)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/children"
        className="text-stone-500 hover:text-stone-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
      >
        ? All Children
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl font-display font-black text-amber-600">
            {child.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-stone-900">
              {child.name}
            </h1>
            <p className="text-stone-500">{ageDisplay}</p>
          </div>
        </div>
        <Link
          href={`/children/${child.id}/edit`}
          className="text-stone-500 hover:text-stone-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-stone-100 transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Activities Done', value: '0', icon: '?' },
          { label: 'Products', value: '0', icon: '??' },
          { label: 'Streak', value: '0 days', icon: '??' },
          { label: 'Progress', value: '0%', icon: '??' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-stone-900">
              {stat.value}
            </div>
            <div className="text-stone-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Progress */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <h2 className="font-display font-bold text-lg text-stone-900 mb-4">
          Learning Areas
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Fine Motor Skills', icon: '?', pct: 0, colour: '#f59e0b' },
            { name: 'Language & Communication', icon: '??', pct: 0, colour: '#3b82f6' },
            { name: 'Early Numeracy', icon: '??', pct: 0, colour: '#10b981' },
            { name: 'Cognitive Skills', icon: '??', pct: 0, colour: '#8b5cf6' },
            { name: 'Creativity', icon: '??', pct: 0, colour: '#ec4899' },
          ].map((area) => (
            <div key={area.name}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <span>{area.icon}</span>
                  {area.name}
                </span>
                <span className="text-sm font-bold text-stone-900">{area.pct}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${area.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">??</div>
        <h2 className="font-display font-bold text-xl mb-2">
          Ready to start learning?
        </h2>
        <p className="text-amber-100 text-sm mb-4">
          Browse products and assign activities to {child.name} to begin tracking progress.
        </p>
        <Link
          href="/products"
          className="bg-white text-amber-600 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-amber-50 transition-colors inline-block"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}
