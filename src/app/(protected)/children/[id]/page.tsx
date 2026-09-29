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
        order:orders(payment_status),
        product:products(*)
      )
    `)
    .eq('child_id', id)
    .eq('active', true)

  const paidAssignedProducts = (assignedProductsData || []).filter((cp: any) => 
    cp.order_item?.order?.payment_status === 'paid'
  );

  const library = paidAssignedProducts
    .map((cp: any) => cp.order_item?.product)
    .filter(Boolean)

  // --- Skill Progress Calculation (double-count-safe) ---
  //
  // Strategy: use DISTINCT activity IDs per category to avoid inflating
  // counts when one activity maps to multiple skills within the same category.
  //
  // Denominator: distinct eligible activity IDs per category
  //   (activities from child's active products -> their skills -> category)
  // Numerator: distinct completed activity IDs that are in the eligible set
  //   (child_activities where completed=true AND activity is in eligible set)

  // 1. Fetch all available activities from assigned products with skill->category mapping
  const { data: availableDataRaw } = await supabase
    .from('child_products')
    .select(`
      order_items (
        orders (payment_status),
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

  const availableData = (availableDataRaw || []).filter((cp: any) => 
    cp.order_items?.orders?.payment_status === 'paid'
  );

  // Build: categoryEligibleActivityIds[catId] = Set<activityId>
  // Using a Set means each activity is counted ONCE per category even if
  // it links to multiple skills in that same category.
  const categoryEligibleActivityIds: Record<string, Set<string>> = {}
  if (skillCategories) {
    skillCategories.forEach(cat => {
      categoryEligibleActivityIds[cat.id] = new Set<string>()
    })
  }

  availableData?.forEach((cp: any) => {
    const acts: any[] = cp.order_items?.products?.activities || []
    acts.forEach((act: any) => {
      act.activity_skills?.forEach((as: any) => {
        const catId = as.skills?.category_id
        if (catId && categoryEligibleActivityIds[catId] !== undefined) {
          categoryEligibleActivityIds[catId].add(act.id)
        }
      })
    })
  })

  // 2. Fetch completed activities for this child
  const { data: completions } = await supabase
    .from('child_activities')
    .select(`
      activity_id,
      activity:activities (
        activity_skills (
          skills (category_id)
        )
      )
    `)
    .eq('child_id', id)
    .eq('completed', true)

  // Build: categoryCompletedActivityIds[catId] = Set<activityId>
  // Only counts an activity if it exists in the eligible set for that category.
  const categoryCompletedActivityIds: Record<string, Set<string>> = {}
  if (skillCategories) {
    skillCategories.forEach(cat => {
      categoryCompletedActivityIds[cat.id] = new Set<string>()
    })
  }

  completions?.forEach((comp: any) => {
    comp.activity?.activity_skills?.forEach((as: any) => {
      const catId = as.skills?.category_id
      if (
        catId &&
        categoryCompletedActivityIds[catId] !== undefined &&
        categoryEligibleActivityIds[catId]?.has(comp.activity_id)
      ) {
        categoryCompletedActivityIds[catId].add(comp.activity_id)
      }
    })
  })

  // Format into SkillProgress array
  const skillProgress = (skillCategories || []).map(cat => {
    const total = categoryEligibleActivityIds[cat.id]?.size ?? 0
    const completed = categoryCompletedActivityIds[cat.id]?.size ?? 0
    return {
      category: cat,
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  })

  // Overall progress: distinct completed eligible activities / distinct total eligible activities
  const allEligibleIds = new Set<string>()
  const allCompletedEligibleIds = new Set<string>()
  Object.values(categoryEligibleActivityIds).forEach(s => s.forEach(actId => allEligibleIds.add(actId)))
  Object.values(categoryCompletedActivityIds).forEach(s => s.forEach(actId => allCompletedEligibleIds.add(actId)))
  const overallProgress = allEligibleIds.size > 0
    ? Math.round((allCompletedEligibleIds.size / allEligibleIds.size) * 100)
    : 0
  // ----------------------------------

  const ageMonths = calculateAgeMonths(child.date_of_birth)
  const ageDisplay = formatAge(ageMonths)

  // Find which products are fully completed
  const completedActivityIdSet = new Set(completions?.map((c: any) => c.activity_id))
  const completedProductIds = new Set<string>()
  availableData?.forEach((cp: any) => {
    const product = cp.order_items?.products
    if (product) {
      const acts = product.activities || []
      if (acts.length > 0 && acts.every((a: any) => completedActivityIdSet.has(a.id))) {
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
        skillProgress={skillProgress}
        overallProgress={overallProgress}
        library={library}
        completedProductIds={Array.from(completedProductIds)}
        aiSummaryNode={<AILearningSummary childId={id} />}
      />
    </div>
  )
}
