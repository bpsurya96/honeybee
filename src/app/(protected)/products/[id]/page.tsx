/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AgeRangeBadge from '@/components/products/AgeRangeBadge'
import SkillBadge from '@/components/products/SkillBadge'
import ActivityCard from '@/components/activities/ActivityCard'
import AddToLibraryButton from '@/components/products/AddToLibraryButton'
import ImageGallery from '@/components/products/ImageGallery'
import fs from 'fs'
import path from 'path'
import type { Skill, Activity } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('name').eq('id', id).single()
  return { title: product?.name ? `${product.name} | HoneyBee` : 'Product | HoneyBee' }
}

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
    .single()

  if (!productData) notFound()

  // Fetch associated activities
  const { data: activitiesData } = await supabase
    .from('activities')
    .select(`
      *,
      activity_skills (
        skills (*)
      )
    `)
    .eq('product_id', id)
    .order('display_order', { ascending: true })

  const product = {
    ...productData,
    skills: productData.product_skills.map((ps: any) => ps.skills).filter(Boolean) as Skill[]
  }

  const activities = (activitiesData || []).map(a => ({
    ...a,
    skills: a.activity_skills.map((as: any) => as.skills).filter(Boolean) as Skill[]
  }))

  // Calculate skill levels for this product
  const skillCounts: Record<string, { count: number, name: string }> = {}
  let maxSkillCount = 0
  activities.forEach(act => {
    act.skills.forEach((skill: any) => {
      if (!skillCounts[skill.id]) {
        skillCounts[skill.id] = { count: 0, name: skill.name }
      }
      skillCounts[skill.id].count++
      if (skillCounts[skill.id].count > maxSkillCount) {
        maxSkillCount = skillCounts[skill.id].count
      }
    })
  })
  
  // If no activities have skills mapped, fallback to the product's top-level skills
  if (Object.keys(skillCounts).length === 0) {
    product.skills.forEach((skill: any) => {
      skillCounts[skill.id] = { count: 1, name: skill.name }
      maxSkillCount = 1
    })
  }
  
  const skillLevels = Object.values(skillCounts).sort((a, b) => b.count - a.count)

  // Get multiple images if available
  let productImages = [product.image_url || 'https://placehold.co/800x800/f8fafc/94a3b8?text=Product'];
  if (product.image_url) {
    try {
      const folderPath = product.image_url.substring(0, product.image_url.lastIndexOf('/'));
      const fullPath = path.join(process.cwd(), 'public', folderPath);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        const images = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')).sort();
        if (images.length > 0) {
          productImages = images.map(f => `${folderPath}/${f}`);
        }
      }
    } catch (e) {
      console.error('Failed to read image directory', e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium mb-6 transition-colors">
        <ChevronLeft size={20} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <ImageGallery images={productImages} alt={product.name} />
        
        <div className="flex flex-col">
          <div className="mb-4">
            <AgeRangeBadge minMonths={product.age_min_months} maxMonths={product.age_max_months} />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-2">
            {product.name}
          </h1>
          <div className="text-2xl font-bold text-amber-600 mb-6">
            �{product.price.toFixed(2)}
          </div>
          
          <p className="text-stone-600 text-lg leading-relaxed mb-8 flex-1">
            {product.description}
          </p>

          <div className="mb-8 bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
            <h3 className="font-display font-bold text-lg text-stone-900 mb-4">Skill Focus Areas</h3>
            <div className="flex flex-col gap-3">
              {skillLevels.map((sl, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1/3 text-sm font-semibold text-stone-700 truncate" title={sl.name}>{sl.name}</div>
                  <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(sl.count / Math.max(maxSkillCount, 1)) * 100}%` }} />
                  </div>
                  <div className="text-xs font-bold text-stone-400 w-6 text-right">{sl.count}</div>
                </div>
              ))}
            </div>
          </div>

          <AddToLibraryButton productId={product.id} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-black text-stone-900">
            Included Activities ({activities.length})
          </h2>
        </div>
        
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-100">
            <div className="text-4xl mb-3">🧸</div>
            <p className="text-stone-500 font-medium">No digital activities available for this product yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
