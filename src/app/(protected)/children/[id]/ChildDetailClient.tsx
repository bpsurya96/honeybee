'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Child, SkillCategory, Product } from '@/types'

const CATEGORY_COLOURS: Record<string, string> = {
  'Language & Literacy': 'from-[var(--color-fun-yellow)] to-amber-500',
  'Cognitive': 'from-[var(--color-fun-purple)] to-purple-800',
  'Motor Skills': 'from-[var(--color-fun-red)] to-[var(--color-fun-red-hover)]',
  'Social & Emotional': 'from-pink-400 to-rose-500',
  'Sensory': 'from-cyan-400 to-blue-500',
}

interface ChildDetailClientProps {
  child: Child
  ageDisplay: string
  skillCategories: SkillCategory[]
  skillProgress: {
    category: SkillCategory
    completed: number
    total: number
    percentage: number
  }[]
  library: Product[]
  completedProductIds: string[]
  aiSummaryNode?: React.ReactNode
}

export default function ChildDetailClient({ 
  child, 
  ageDisplay, 
  skillCategories, 
  skillProgress, 
  library,
  completedProductIds,
  aiSummaryNode
}: ChildDetailClientProps) {
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
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-8 mt-2 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentUrl={child.avatar_url}
            name={child.name}
            onUpload={handleAvatarUpload}
            size="lg"
          />
          <div>
            <h1 className="text-3xl font-display font-black text-stone-900">{child.name}</h1>
            <p className="text-stone-500 font-medium">{ageDisplay}</p>
          </div>
        </div>
        <Link
          href={`/children/${child.id}/edit`}
          className="text-stone-500 bg-stone-100 hover:text-stone-900 hover:bg-stone-200 font-bold text-sm px-5 py-2 btn-pill transition-colors"
        >
          Edit ✏️
        </Link>
      </div>

      {/* 2. My Library */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-black text-[var(--color-fun-purple)]">
            📚 My Library
          </h2>
        </div>
        
        {library && library.length > 0 ? (
          <div className="flex flex-col gap-4">
            {library.map((product) => {
              const isCompleted = completedProductIds.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  className="group flex items-center justify-between bg-white rounded-3xl p-4 shadow-sm border border-stone-100 card-bouncy gap-4"
                >
                  <Link href={`/products/${product.id}`} className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100">
                      <img 
                        src={product.image_url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-stone-900 leading-tight">
                        {product.name}
                      </h3>
                      {isCompleted && (
                        <p className="text-emerald-600 text-xs font-semibold mt-1">✨ 100% Completed</p>
                      )}
                    </div>
                  </Link>

                  <div className="flex-shrink-0 transition-opacity duration-300">
                    {!isCompleted ? (
                      <button 
                        onClick={async () => {
                          if (confirm('Are you sure you want to mark all activities in this book as completed?')) {
                            try {
                              const res = await fetch(`/api/children/${child.id}/complete-product`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ product_id: product.id })
                              })
                              if (!res.ok) throw new Error('Failed to complete')
                              success('Book marked as completed! Skills updated.')
                              router.refresh()
                            } catch (e: any) {
                              showError(e.message)
                            }
                          }
                        }}
                        className="bg-[var(--color-fun-yellow)] hover:bg-amber-400 text-stone-900 font-bold py-2.5 px-5 btn-pill transition-all shadow-sm flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                      >
                        ✓ Mark as completed
                      </button>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-700 font-bold py-2.5 px-5 btn-pill text-center text-sm border border-emerald-100 flex items-center justify-center gap-2 whitespace-nowrap">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[var(--color-fun-yellow)] to-amber-500 rounded-3xl p-8 text-stone-900 text-center shadow-md">
            <div className="text-5xl mb-4 animate-bounce">🎨</div>
            <h2 className="font-display font-bold text-2xl mb-3">Ready to start learning?</h2>
            <p className="text-stone-800 mb-6 text-lg max-w-lg mx-auto leading-relaxed">
              Browse products and assign learning kits to {child.name} to begin tracking progress and unlock their digital activities.
            </p>
            <Link href="/products" className="bg-white text-[var(--color-fun-red)] font-bold px-8 py-3.5 btn-pill text-base transition-colors inline-block shadow-sm card-bouncy">
              Browse Kits 🚀
            </Link>
          </div>
        )}
      </div>

      {/* 3. Stats */}
      <h2 className="text-2xl font-display font-black text-stone-900 mb-4">
        📊 Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Activities Done', value: '0', icon: '📝' },
          { label: 'Products', value: library.length.toString(), icon: '📦' },
          { label: 'Streak', value: '0 days', icon: '🔥' },
          { label: 'Progress', value: '0%', icon: '📈' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 text-center card-bouncy">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-[var(--color-fun-red)]">{stat.value}</div>
            <div className="text-stone-500 font-semibold text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 4. AI Learning Profile */}
      {aiSummaryNode}

      {/* 5. Learning Areas */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-8 mt-8">
        <h2 className="font-display font-bold text-xl text-stone-900 mb-6">🎯 Learning Areas Breakdown</h2>
        <div className="space-y-5">
          {skillCategories.slice(0, 6).map((cat) => {
            const gradient = CATEGORY_COLOURS[cat.name] || 'from-stone-400 to-stone-500'
            const progress = skillProgress.find(p => p.category.id === cat.id)
            const percentage = progress ? Math.round(progress.percentage) : 0
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span className="text-sm font-black text-[var(--color-fun-purple)]">{percentage}%</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full bg-gradient-to-r ${gradient} rounded-full`} style={{ width: `${percentage}%`, transition: 'width 1s ease-out' }} />
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-stone-400 font-medium text-xs mt-6 text-center">
          *Progress updates as activities are completed.
        </p>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
