'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Child, SkillCategory } from '@/types'

interface ChildDetailClientProps {
  child: Child
  ageDisplay: string
  skillCategories: SkillCategory[]
}

const CATEGORY_COLOURS: Record<string, string> = {
  'Fine Motor Skills': 'from-amber-400 to-orange-400',
  'Language & Communication': 'from-blue-400 to-indigo-400',
  'Early Numeracy': 'from-emerald-400 to-teal-400',
  'Cognitive Skills': 'from-violet-400 to-purple-400',
  'Problem Solving': 'from-orange-400 to-red-400',
  'Creativity': 'from-pink-400 to-rose-400',
  'Pre-writing': 'from-cyan-400 to-sky-400',
  'Sensory Exploration': 'from-lime-400 to-green-400',
  'Social & Emotional Learning': 'from-red-400 to-pink-400',
}

export default function ChildDetailClient({ child, ageDisplay, skillCategories }: ChildDetailClientProps) {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()

  async function handleAvatarUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target', child.id)
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    success('Photo updated!')
    router.refresh()
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentUrl={child.avatar_url}
            name={child.name}
            onUpload={handleAvatarUpload}
            size="lg"
          />
          <div>
            <h1 className="text-3xl font-display font-black text-stone-900">{child.name}</h1>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Activities Done', value: '0', icon: '?' },
          { label: 'Products', value: '0', icon: '??' },
          { label: 'Streak', value: '0 days', icon: '??' },
          { label: 'Progress', value: '0%', icon: '??' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-stone-900">{stat.value}</div>
            <div className="text-stone-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Areas */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <h2 className="font-display font-bold text-lg text-stone-900 mb-4">Learning Areas</h2>
        <div className="space-y-4">
          {skillCategories.slice(0, 6).map((cat) => {
            const gradient = CATEGORY_COLOURS[cat.name] || 'from-amber-400 to-orange-400'
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-stone-700 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span className="text-sm font-bold text-stone-900">0%</span>
                </div>
                <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: '0%', transition: 'width 1s ease-out' }} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-stone-400 text-xs mt-4 text-center">
          Progress updates as activities are completed.
        </p>
      </div>

      {/* Get Started CTA */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">??</div>
        <h2 className="font-display font-bold text-xl mb-2">Ready to start learning?</h2>
        <p className="text-amber-100 text-sm mb-4">
          Browse products and assign activities to {child.name} to begin tracking progress.
        </p>
        <Link href="/products" className="bg-white text-amber-600 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-amber-50 transition-colors inline-block">
          Browse Products
        </Link>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
