'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { useToast } from '@/hooks/useToast'
import type { Child, LearningArea } from '@/types'
import { CheckCircle2, Circle } from 'lucide-react'
import SkillRadarChart from '@/components/dashboard/SkillRadarChart'

const LEARNING_AREA_COLOURS: Record<string, string> = {
  'Language & Literacy': 'from-[var(--color-fun-yellow)] to-amber-500',
  'Cognitive': 'from-[var(--color-fun-purple)] to-purple-800',
  'Motor Skills': 'from-[var(--color-fun-red)] to-[var(--color-fun-red-hover)]',
  'Social & Emotional': 'from-pink-400 to-rose-500',
  'Sensory': 'from-cyan-400 to-blue-500',
}

interface ChildDetailClientProps {
  child: Child
  ageDisplay: string
  learningAreaProgress: {
    learning_area: LearningArea
    completed: number
    total: number
    percentage: number
  }[]
  overallProgress: number
  library: any[]
}

export default function ChildDetailClient({
  child,
  ageDisplay,
  learningAreaProgress,
  overallProgress,
  library
}: ChildDetailClientProps) {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  async function handleAvatarUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target', child.id)
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    success('Photo updated!')
    router.refresh()
  }

  async function toggleActivity(activityId: string, currentStatus: boolean) {
    if (updatingIds.has(activityId)) return
    
    setUpdatingIds(prev => new Set(prev).add(activityId))
    try {
      const res = await fetch(`/api/children/${child.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activityId, completed: !currentStatus })
      })
      if (!res.ok) throw new Error('Failed to update')
      router.refresh()
    } catch (err) {
      showError('Failed to update activity')
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev)
        next.delete(activityId)
        return next
      })
    }
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
          Edit ??
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress */}
        <div className="lg:col-span-1 space-y-8">
          {/* Overall Progress */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h2 className="text-xl font-display font-black text-stone-900 mb-6">Learning Progress</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 shrink-0 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-stone-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[var(--color-fun-purple)] transition-all duration-1000 ease-out" strokeDasharray={`${overallProgress}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-stone-900">
                  {overallProgress}%
                </div>
              </div>
              <p className="text-stone-500 text-sm">Overall completion across all assigned activities.</p>
            </div>
            
            {/* Radar Chart Component */}
            {learningAreaProgress.length > 2 && (
              <div className="mt-8">
                <SkillRadarChart data={learningAreaProgress} />
              </div>
            )}
          </div>
          
          {/* Detailed Area Progress */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-900 mb-4">Area Breakdown</h3>
            <div className="space-y-4">
              {learningAreaProgress.map((p) => {
                const gradient = LEARNING_AREA_COLOURS[p.learning_area.name] || 'from-stone-400 to-stone-500'
                const percentage = Math.round(p.percentage)
                return (
                  <div key={p.learning_area.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-stone-700">{p.learning_area.name}</span>
                      <span className="text-xs font-bold text-stone-500">{percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Library & Activities */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-display font-black text-[var(--color-fun-purple)] mb-6">
            ?? Parent Library
          </h2>
          
          {library.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center">
              <p className="text-stone-500 mb-4">No products assigned yet.</p>
              <Link href="/products" className="bg-[var(--color-fun-yellow)] font-bold text-stone-900 px-6 py-2 rounded-xl inline-block hover:brightness-105">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {library.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 overflow-hidden">
                  
                  <div className="flex items-center gap-4 pb-6 border-b border-stone-100 mb-6">
                    <img src={product.image_url || 'https://placehold.co/100x100?text=Kit'} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-xl font-display font-black text-stone-900">{product.name}</h3>
                      <p className="text-sm text-stone-500">{product.activities.length} Activities</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {product.activities.map((act: any) => (
                      <div 
                        key={act.id}
                        className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${act.isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-stone-50 border-stone-100 hover:bg-white'}`}
                        onClick={() => toggleActivity(act.id, act.isCompleted)}
                      >
                        <button 
                          className={`shrink-0 mt-0.5 transition-colors ${updatingIds.has(act.id) ? 'opacity-50' : ''}`}
                          disabled={updatingIds.has(act.id)}
                        >
                          {act.isCompleted ? (
                            <CheckCircle2 size={24} className="text-emerald-500 drop-shadow-sm" />
                          ) : (
                            <Circle size={24} className="text-stone-300 group-hover:text-stone-400" />
                          )}
                        </button>
                        <div>
                          <h4 className={`font-bold ${act.isCompleted ? 'text-emerald-900' : 'text-stone-900'}`}>{act.title}</h4>
                          <p className={`text-sm mt-1 line-clamp-2 ${act.isCompleted ? 'text-emerald-700/80' : 'text-stone-500'}`}>{act.description}</p>
                        </div>
                      </div>
                    ))}
                    {product.activities.length === 0 && (
                      <p className="text-sm text-stone-400 italic">No activities tracked for this product.</p>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </>
  )
}

