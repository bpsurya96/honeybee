'use client'

import ProductCard from '@/components/products/ProductCard'

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
  library: any[]
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

export default function ChildDetailClient({ child, ageDisplay, skillCategories, library }: ChildDetailClientProps) {
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

      
      {/* My Library */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-black text-stone-900">
            My Library
          </h2>
        </div>
        
        {library && library.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {library.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white text-center shadow-md">
            <div className="text-5xl mb-4">??</div>
            <h2 className="font-display font-bold text-2xl mb-3">Ready to start learning?</h2>
            <p className="text-amber-50 mb-6 text-lg max-w-lg mx-auto leading-relaxed">
              Browse products and assign learning kits to {child.name} to begin tracking progress and unlock their digital activities.
            </p>
            <Link href="/products" className="bg-white text-amber-600 font-bold px-8 py-3.5 rounded-full text-base hover:bg-amber-50 transition-colors inline-block shadow-sm">
              Browse Kits
            </Link>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
