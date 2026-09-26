/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatAge, calculateAgeMonths } from '@/lib/utils'
import ChildDetailClient from './ChildDetailClient'
import AILearningSummary from './AILearningSummary'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: child } = await supabase.from('children').select('name').eq('id', id).single()
  return { title: child?.name ? `${child.name}'s Dashboard` : 'Child Dashboard' }
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .eq('parent_id', user.id)
    .single()

  if (!child) notFound()

  // Fetch skill categories for progress display
  const { data: skillCategories } = await supabase
    .from('skill_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  // Fetch assigned products (My Library)
  const { data: assignedProductsData } = await supabase
    .from('child_products')
    .select(`
      id,
      order_item:order_items(
        product:products(*)
      )
    `)
    .eq('child_id', id)
    .eq('active', true)

  const library = (assignedProductsData || [])
    .map((cp: any) => cp.order_item?.product)
    .filter(Boolean)

  
  // --- Skill Progress Calculation ---
  // 1. Fetch all completions for this child
  const { data: completions } = await supabase
    .from('child_activities')
    .select(`
      activity_id,
      completed,
      activity:activities (
        activity_skills (
          skills (category_id)
        )
      )
    `)
    .eq('child_id', id)
    .eq('completed', true)

  // 2. Fetch all available activities from assigned products to get total possible skills
  const { data: availableData } = await supabase
    .from('child_products')
    .select(`
      order_items (
        products (
          id,
          activities (
            id,
            activity_skills (
              skills (category_id)
            )
          )
        )
      )
    `)
    .eq('child_id', id)
    .eq('active', true)

  // Calculate totals per category
  const categoryTotals: Record<string, number> = {}
  const categoryCompleted: Record<string, number> = {}
  
  if (skillCategories) {
    skillCategories.forEach(cat => {
      categoryTotals[cat.id] = 0
      categoryCompleted[cat.id] = 0
    })
  }

  // Count available
  availableData?.forEach((cp: any) => {
    const acts = cp.order_items?.products?.activities || []
    acts.forEach((act: any) => {
      act.activity_skills?.forEach((as: any) => {
        const catId = as.skills?.category_id
        if (catId && categoryTotals[catId] !== undefined) {
          categoryTotals[catId]++
        }
      })
    })
  })

  // Count completed
  completions?.forEach((comp: any) => {
    comp.activity?.activity_skills?.forEach((as: any) => {
      const catId = as.skills?.category_id
      if (catId && categoryCompleted[catId] !== undefined) {
        categoryCompleted[catId]++
      }
    })
  })

  // Format into SkillProgress array
  const skillProgress = (skillCategories || []).map(cat => {
    const total = categoryTotals[cat.id] || 0
    const completed = categoryCompleted[cat.id] || 0
    return {
      category: cat,
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  })
  // ----------------------------------
  
  const ageMonths = calculateAgeMonths(child.date_of_birth)
  const ageDisplay = formatAge(ageMonths)

  // Find which products are fully completed
  const completedSet = new Set(completions?.map((c: any) => c.activity_id))
  const completedProductIds = new Set<string>()
  availableData?.forEach((cp: any) => {
    const product = cp.order_items?.products
    if (product) {
      const acts = product.activities || []
      if (acts.length > 0 && acts.every((a: any) => completedSet.has(a.id))) {
         completedProductIds.add(product.id)
      }
    }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/children" className="text-stone-500 hover:text-[var(--color-fun-purple)] text-sm font-medium mb-4 inline-flex items-center gap-1">
        ← All Children
      </Link>

      <ChildDetailClient
        child={child}
        ageDisplay={ageDisplay}
        skillCategories={skillCategories || []}
        skillProgress={skillProgress}
        library={library}
        completedProductIds={Array.from(completedProductIds)}
        aiSummaryNode={<AILearningSummary childId={id} />}
      />
    </div>
  )
}
