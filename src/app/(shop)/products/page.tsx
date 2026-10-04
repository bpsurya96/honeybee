
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import ProductsFilter from '@/components/products/ProductsFilter'
import ProductsPagination from '@/components/products/ProductsPagination'
import { Suspense } from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'All Products | HoneyBee Learning',
  description: 'Discover expert-designed learning kits for your childs development.',
}

const PAGE_SIZE = 12;

export default async function ProductsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const [
    { data: ageStages },
    { data: categories },
    { data: skills }
  ] = await Promise.all([
    supabase.from('age_stages').select('*').order('display_order'),
    supabase.from('skill_categories').select('*').order('display_order'),
    supabase.from('skills').select('*').eq('active', true).order('name')
  ])

  const page = parseInt(searchParams.page || '1')
  const ageId = searchParams.age
  const categoryId = searchParams.category
  const skillId = searchParams.skill
  const q = searchParams.q

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const selectQuery = [
    'id, name, slug, description, image_url, thumbnail_url, price, age_min_months, age_max_months, active',
    (categoryId || skillId) ? 'filter_skills:product_skills!inner(skills!inner(id, category_id))' : '',
    'all_skills:product_skills(skills(id, name, skill_categories(name, icon, colour)))'
  ].filter(Boolean).join(', ');

  let query = supabase
    .from('products')
    .select(selectQuery as any, { count: 'exact' })
    .eq('active', true)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  if (ageId) {
    const selectedAge = ageStages?.find(a => a.id === ageId)
    if (selectedAge) {
      query = query.lte('age_min_months', selectedAge.max_months).gte('age_max_months', selectedAge.min_months)
    }
  }

  if (categoryId) {
    query = query.eq('filter_skills.skills.category_id', categoryId)
  }

  if (skillId) {
    query = query.eq('filter_skills.skills.id', skillId)
  }

  const { data: rawProducts, count } = await query
    .order('age_min_months', { ascending: true })
    .range(from, to)

  const products = (rawProducts || []).map((p: any) => ({
    ...p,
    skills: p.all_skills.map((ps: any) => ps.skills).filter(Boolean)
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <Suspense fallback={<div className="w-64 shrink-0" />}>
        <ProductsFilter 
          ageStages={ageStages || []} 
          categories={categories || []} 
          skills={skills || []} 
        />
      </Suspense>

      <div className="flex-1 w-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-2">
              Learning Kits
            </h1>
            <p className="text-stone-500 max-w-xl text-lg">
              Expert-designed physical products paired with digital activities.
            </p>
          </div>
          <div className="text-sm font-bold text-stone-400">
            {count || 0} product{count !== 1 ? 's' : ''} found
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <Suspense fallback={null}>
              <ProductsPagination 
                totalItems={count || 0} 
                pageSize={PAGE_SIZE} 
                currentPage={page} 
              />
            </Suspense>
          </>
        ) : (
          <div className="text-center py-24 bg-stone-50 rounded-3xl border border-stone-100 border-dashed flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 mb-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h2 className="text-2xl font-display font-bold text-stone-700 mb-2">No products found</h2>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              We couldn't find any learning kits matching your exact filters. Try clearing some filters or searching for something else.
            </p>
            <Link 
              href="/products" 
              className="inline-block bg-white text-stone-700 border border-stone-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow hover:text-amber-600 transition-all"
            >
              Clear All Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
