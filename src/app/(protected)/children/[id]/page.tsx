import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { formatAge, calculateAgeMonths } from '@/lib/utils'
import AICoachWidget from './AICoachWidget'
import ChildDetailClient from './ChildDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: child } = await supabase.from('children').select('name').eq('id', id).single()
  return { title: child?.name ? `${child.name}'s Dashboard` : 'Child Dashboard' }
}

export default async function ChildDetailPage(props: PageProps) {
  const { id } = await props.params
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

  // 1. Fetch assigned products
  const { data: childProducts } = await supabase
    .from('child_products')
    .select(`
      product_id,
      products (
        name,
        product_images (image_url)
      )
    `)
    .eq('child_id', id)
    .eq('active', true)

  const productIds = childProducts?.map(cp => cp.product_id) || []

  // 2. Fetch all activities for those products, including skills and learning areas
  let activities: any[] = []
  if (productIds.length > 0) {
    const { data: acts } = await supabase
      .from('activities')
      .select(`
        *,
        activity_skills (
          skills (
            id,
            name,
            learning_area:learning_areas (id, name, description)
          )
        )
      `)
      .in('product_id', productIds)
      .order('display_order', { ascending: true })
    activities = acts || []
  }

  // 3. Fetch completion status
  const { data: completions } = await supabase
    .from('child_activities')
    .select('activity_id, completed')
    .eq('child_id', id)
    .eq('completed', true)
  
  const completedActivityIds = new Set(completions?.map(c => c.activity_id) || [])

  // 4. Calculate Progress per Learning Area
  // We compute based on the total unique activities per area available to the child
  const areaStats: Record<string, { id: string, name: string, total: number, completed: number, uniqueActivities: Set<string>, completedActivities: Set<string> }> = {}
  
  activities.forEach(act => {
    act.activity_skills?.forEach((as: any) => {
      const area = as.skills?.learning_area
      if (!area) return
      
      if (!areaStats[area.id]) {
        areaStats[area.id] = { id: area.id, name: area.name, total: 0, completed: 0, uniqueActivities: new Set(), completedActivities: new Set() }
      }
      
      areaStats[area.id].uniqueActivities.add(act.id)
      if (completedActivityIds.has(act.id)) {
        areaStats[area.id].completedActivities.add(act.id)
      }
    })
  })

  let overallTotal = 0
  let overallCompleted = 0
  const uniqueAllActivities = new Set<string>()
  const uniqueAllCompleted = new Set<string>()

  const learningAreaProgress = Object.values(areaStats).map(stat => {
    const total = stat.uniqueActivities.size
    const completed = stat.completedActivities.size
    
    stat.uniqueActivities.forEach(a => uniqueAllActivities.add(a))
    stat.completedActivities.forEach(a => uniqueAllCompleted.add(a))

    return {
      learning_area: { id: stat.id, name: stat.name, description: null, active: true, display_order: 0, created_at: '' },
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    }
  }).sort((a, b) => b.percentage - a.percentage)

  overallTotal = uniqueAllActivities.size
  overallCompleted = uniqueAllCompleted.size
  const overallProgress = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0

  // 5. Structure data for the client
  // Group activities by product so the UI looks like a "Library"
  const libraryMap = new Map<string, any>()
  childProducts?.forEach(cp => {
    const p = Array.isArray(cp.products) ? cp.products[0] : cp.products;
    libraryMap.set(cp.product_id, {
      id: cp.product_id,
      name: p?.name,
      image_url: p?.product_images?.[0]?.image_url,
      activities: []
    })
  })

  activities.forEach(act => {
    if (libraryMap.has(act.product_id)) {
      const isCompleted = completedActivityIds.has(act.id)
      libraryMap.get(act.product_id).activities.push({
        ...act,
        isCompleted
      })
    }
  })

  const library = Array.from(libraryMap.values())

    const { data: profile } = await supabase.from('profiles').select('ai_credits').eq('id', user.id).single()
  const initialCredits = profile?.ai_credits || 0
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ChildDetailClient 
        child={child}
        ageDisplay={formatAge(calculateAgeMonths(child.date_of_birth))}
        learningAreaProgress={learningAreaProgress}
        overallProgress={overallProgress}
        library={library}
      />
      <AICoachWidget childId={id} childName={child.name} initialCredits={initialCredits} />
    </div>
  )
}

