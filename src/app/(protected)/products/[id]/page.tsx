/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import ImageGallery from '@/components/products/ImageGallery'
import ProductHeroClient from './ProductHeroClient'
import { formatAgeRange } from '@/lib/utils'
import fs from 'fs'
import path from 'path'
import type { Skill, Activity } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', id)
    .single()
  return {
    title: product?.name ? `${product.name} | HoneyBee Learning` : 'Product | HoneyBee Learning',
    description: product?.description || undefined,
  }
}

const CATEGORY_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  'Language & Literacy': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-100' },
  'Cognitive': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-100' },
  'Motor Skills': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-100' },
  'Social & Emotional': { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-100' },
  'Sensory': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-100' },
  'Creativity': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-100' },
}
const DEFAULT_COL = { bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-100' }

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: productData } = await supabase
    .from('products')
    .select(`
      *,
      product_skills (
        skills (*)
      )
    `)
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!productData) notFound()

  // Fetch activities with skills and categories
  const { data: activitiesData } = await supabase
    .from('activities')
    .select(`
      *,
      activity_skills (
        skills (*, category:skill_categories(*))
      )
    `)
    .eq('product_id', id)
    .eq('active', true)
    .order('sequence_order', { ascending: true })

  const product = {
    ...productData,
    skills: productData.product_skills.map((ps: any) => ps.skills).filter(Boolean) as Skill[],
  }

  const activities = (activitiesData || []).map((a: any) => ({
    ...a,
    skills: a.activity_skills.map((as: any) => as.skills).filter(Boolean) as Skill[],
  })) as (Activity & { skills: Skill[] })[]

  // Skill frequency bars (from activity data)
  const skillCounts: Record<string, { count: number; name: string }> = {}
  let maxSkillCount = 0
  activities.forEach(act => {
    act.skills.forEach((skill: any) => {
      if (!skillCounts[skill.id]) skillCounts[skill.id] = { count: 0, name: skill.name }
      skillCounts[skill.id].count++
      if (skillCounts[skill.id].count > maxSkillCount) maxSkillCount = skillCounts[skill.id].count
    })
  })
  if (Object.keys(skillCounts).length === 0) {
    product.skills.forEach((skill: any) => { skillCounts[skill.id] = { count: 1, name: skill.name }; maxSkillCount = 1 })
  }
  const skillLevels = Object.values(skillCounts).sort((a, b) => b.count - a.count)

  // Skill categories from activities
  const { data: categoriesData } = await supabase
    .from('skill_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  const categoryActivityCount: Record<string, number> = {}
  ;(activitiesData || []).forEach((act: any) => {
    act.activity_skills?.forEach((as: any) => {
      const catId = as.skills?.category_id
      if (catId) categoryActivityCount[catId] = (categoryActivityCount[catId] || 0) + 1
    })
  })
  if (Object.keys(categoryActivityCount).length === 0) {
    product.skills.forEach((skill: any) => {
      if (skill.category_id) categoryActivityCount[skill.category_id] = (categoryActivityCount[skill.category_id] || 0) + 1
    })
  }
  const skillProgress = (categoriesData || [])
    .filter(cat => categoryActivityCount[cat.id])
    .map(cat => ({ category: cat, count: categoryActivityCount[cat.id] || 0 }))

  // Multiple images detection
  let productImages = [product.image_url || 'https://placehold.co/800x800/fef3c7/d97706?text=Product']
  if (product.image_url) {
    try {
      const folderPath = product.image_url.substring(0, product.image_url.lastIndexOf('/'))
      const fullPath = path.join(process.cwd(), 'public', folderPath)
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath)
        const imgs = files.filter(f => /\.(png|jpg|webp)$/i.test(f)).sort()
        if (imgs.length > 0) productImages = imgs.map(f => `${folderPath}/${f}`)
      }
    } catch { /* silently fall back to single image */ }
  }

  const ageDisplay = formatAgeRange(product.age_min_months, product.age_max_months)
  const hasSkillProgress = skillProgress.length > 0
  const hasActivities = activities.length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32 md:pb-12">

      {/* Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 font-medium mb-8 transition-colors text-sm group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        Back to Products
      </Link>

      {/* HERO */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 mb-16 items-start">

        {/* LEFT: image gallery (sticky on desktop) */}
        <div className="md:sticky md:top-20">
          <ImageGallery images={productImages} alt={product.name} />
        </div>

        {/* RIGHT: interactive cart section */}
        <ProductHeroClient
          product={product}
          ageDisplay={ageDisplay}
          activityCount={activities.length}
        />
      </div>

      {/* WHAT YOUR CHILD WILL LEARN */}
      {hasSkillProgress && (
        <section className="mb-16" aria-labelledby="learning-heading">
          <div className="text-center mb-8">
            <h2 id="learning-heading" className="text-2xl md:text-3xl font-display font-black text-stone-900 mb-2">
              🌟 What Your Child Will Learn
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto text-sm">
              This kit develops multiple key skills through hands-on activities.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {skillProgress.map(({ category, count }) => {
              const col = CATEGORY_COLOURS[category.name] || DEFAULT_COL
              return (
                <div
                  key={category.id}
                  className={`${col.bg} ${col.border} border rounded-3xl p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200`}
                >
                  <div className="text-3xl mb-2" aria-hidden="true">{category.icon || '⭐'}</div>
                  <h3 className={`font-display font-bold text-sm ${col.text} leading-tight`}>
                    {category.name}
                  </h3>
                  {count > 0 && (
                    <p className="text-xs text-stone-400 mt-1 font-medium">
                      {count} {count === 1 ? 'activity' : 'activities'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Skill depth bars */}
          {skillLevels.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-display font-bold text-stone-900 mb-5 text-base">Skill Depth</h3>
              <div className="space-y-3">
                {skillLevels.slice(0, 8).map((sl, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-1/3 text-sm font-semibold text-stone-600 truncate" title={sl.name}>{sl.name}</div>
                    <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(sl.count / Math.max(maxSkillCount, 1)) * 100}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}
                        role="progressbar"
                        aria-valuenow={sl.count}
                        aria-valuemax={maxSkillCount}
                        aria-label={`${sl.name} skill frequency`}
                      />
                    </div>
                    <div className="text-xs font-bold text-stone-400 w-5 text-right">{sl.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ACTIVITIES */}
      {hasActivities && (
        <section className="mb-16" aria-labelledby="activities-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="activities-heading" className="text-2xl md:text-3xl font-display font-black text-stone-900">
              🎯 Explore the Activities
            </h2>
            <span className="bg-amber-100 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full">
              {activities.length} total
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {activities.map((activity, idx) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="group flex gap-4 bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center text-amber-700 font-display font-black text-xl group-hover:from-amber-200 group-hover:to-amber-300 transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-display font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                      {activity.name}
                    </h4>
                    {activity.duration_mins && (
                      <span className="flex-shrink-0 text-xs font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100 whitespace-nowrap">
                        {activity.duration_mins}m
                      </span>
                    )}
                  </div>
                  {activity.description && (
                    <p className="text-stone-500 text-sm line-clamp-2 mb-2">{activity.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    {activity.skills && activity.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {activity.skills.slice(0, 2).map((s: any) => (
                          <span key={s.id} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {activity.difficulty > 0 && (
                      <div className="flex items-center gap-0.5" aria-label={`Difficulty ${activity.difficulty} of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < activity.difficulty ? 'bg-amber-400' : 'bg-stone-200'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      {product.description && (
        <section className="mb-16 bg-white rounded-3xl p-8 shadow-sm border border-stone-100" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-2xl font-display font-black text-stone-900 mb-4 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center" aria-hidden="true">
              <BookOpen size={18} className="text-amber-700" />
            </span>
            About This Kit
          </h2>
          <p className="text-stone-600 leading-relaxed text-base mb-6">{product.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
              <p className="text-2xl mb-1" aria-hidden="true">👶</p>
              <p className="text-xs text-stone-500 font-medium">Recommended Age</p>
              <p className="font-display font-bold text-stone-900 text-sm mt-0.5">{ageDisplay}</p>
            </div>
            {hasActivities && (
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p className="text-2xl mb-1" aria-hidden="true">🎮</p>
                <p className="text-xs text-stone-500 font-medium">Activities</p>
                <p className="font-display font-bold text-stone-900 text-sm mt-0.5">{activities.length} included</p>
              </div>
            )}
            {product.skills.length > 0 && (
              <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                <p className="text-2xl mb-1" aria-hidden="true">🧠</p>
                <p className="text-xs text-stone-500 font-medium">Skill Areas</p>
                <p className="font-display font-bold text-stone-900 text-sm mt-0.5">{product.skills.length} covered</p>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  )
}
