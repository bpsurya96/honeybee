/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Star, ShieldCheck, Truck } from 'lucide-react'
import ImageGallery from '@/components/products/ImageGallery'
import ProductHeroClient from './ProductHeroClient'
import type { Skill, Activity } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: product } = await supabase.from('products').select('name, description').eq('id', id).single()
  return {
    title: product?.name ? `${product.name} | HoneyBee` : 'Product',
    description: product?.description || undefined,
  }
}

export default async function ProductDetailPage(props: PageProps) {
  const { id } = await props.params
  const supabase = await createClient()

  // 1. Fetch Product with Images & Skills
  const { data: productData } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*),
      product_skills (
        skills (*, learning_area:learning_areas(*))
      )
    `)
    .eq('id', id)
    .single()

  if (!productData) notFound()

  // 2. Format Skills
  const rawSkills = productData.product_skills?.map((ps: any) => ps.skills).filter(Boolean) || []
  
  // 3. Fetch Activities
  const { data: activitiesData } = await supabase
    .from('activities')
    .select(`
      *,
      activity_skills (
        skills (*, learning_area:learning_areas(*))
      )
    `)
    .eq('product_id', id)
    .order('display_order', { ascending: true })

  const activities = (activitiesData || []).map((a: any) => ({
    ...a,
    skills: a.activity_skills?.map((as: any) => as.skills).filter(Boolean) || []
  }))

  const images = (productData.product_images || []).sort((a: any, b: any) => a.display_order - b.display_order)
  if (images.length === 0) {
    images.push({ id: 'dummy', image_url: 'https://placehold.co/800x800/f8fafc/94a3b8?text=Product' })
  }

  // Extract unique learning areas
  const learningAreasMap = new Map()
  rawSkills.forEach((s: any) => {
    if (s.learning_area) learningAreasMap.set(s.learning_area.id, s.learning_area)
  })
  const learningAreas = Array.from(learningAreasMap.values())

  const product = {
    ...productData,
    images
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-24">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/products" className="p-2 -ml-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="text-sm font-medium text-stone-500">
            <Link href="/products" className="hover:text-stone-900">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* TOP SECTION: Gallery & Buy Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100">
            <ImageGallery images={images.map((img: any) => img.image_url)} alt={product.name} />
          </div>
          
          <div className="flex flex-col">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full uppercase tracking-wider mb-4 w-fit">
              {product.min_age_months} - {product.max_age_months} Months
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-stone-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="text-3xl font-black text-[var(--color-fun-red)] mb-6">
              ?{product.price.toFixed(2)}
            </div>
            
            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
              {product.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-sm font-semibold text-stone-700 leading-tight">Child Safe<br/>Materials</div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <div className="text-sm font-semibold text-stone-700 leading-tight">Express<br/>Delivery</div>
              </div>
            </div>

            <div className="mt-auto border-t border-stone-200 pt-8">
              <ProductHeroClient product={product} />
            </div>
          </div>
        </div>

        {/* LEARNING VALUE SECTION */}
        {learningAreas.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display font-black text-stone-900 mb-4">What will they learn?</h2>
              <p className="text-stone-500">Expert-designed for specific developmental milestones.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {learningAreas.map((area: any) => (
                <div key={area.id} className="bg-white rounded-3xl p-6 text-center shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto bg-stone-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                    ??
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{area.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-3">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITIES SECTION */}
        {activities.length > 0 && (
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[var(--color-fun-purple)] rounded-2xl flex items-center justify-center text-white shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-stone-900">Included Activities</h2>
                <p className="text-stone-500">Guided play ideas for you and your child.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act: any, idx: number) => (
                <div key={act.id} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <div className="text-[var(--color-fun-purple)] font-black text-xl mb-3 opacity-30">
                    #{idx + 1}
                  </div>
                  <h3 className="font-bold text-lg text-stone-900 mb-2">{act.title}</h3>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-3">{act.description}</p>
                  
                  {act.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {act.skills.map((s: any) => (
                        <span key={s.id} className="text-[10px] font-bold px-2 py-1 bg-white border border-stone-200 text-stone-600 rounded-lg uppercase tracking-wider">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
