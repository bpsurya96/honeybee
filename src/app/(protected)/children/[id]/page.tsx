
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatAge, calculateAgeMonths } from '@/lib/utils'
import ChildDetailClient from './ChildDetailClient'

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

  const ageMonths = calculateAgeMonths(child.date_of_birth)
  const ageDisplay = formatAge(ageMonths)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/children" className="text-stone-500 hover:text-stone-700 text-sm font-medium mb-4 inline-flex items-center gap-1">
        ? All Children
      </Link>

      <ChildDetailClient
        child={child}
        ageDisplay={ageDisplay}
        skillCategories={skillCategories || []}
        library={library}
      />
    </div>
  )
}
