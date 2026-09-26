/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import Link from 'next/link'
import type { Product, Skill } from '@/types'

export const metadata: Metadata = {
  title: 'Products | HoneyBee Learning',
}

export default async function ProductsPage(props: { searchParams: Promise<{ skill?: string }> }) {
  const searchParams = await props.searchParams;
  const filterSkill = searchParams?.skill;
  const supabase = await createClient()

  // Fetch all active products
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      product_skills (
        skills (*)
      )
    `)
    .eq('active', true)
    .order('age_min_months', { ascending: true })

  // Fetch all skills for filter
  const { data: allSkills } = await supabase.from('skills').select('*').eq('active', true).order('name', { ascending: true });

  // Transform data
  let products = (productsData || []).map(p => ({
    ...p,
    skills: p.product_skills.map((ps: any) => ps.skills).filter(Boolean) as Skill[]
  }))

  if (filterSkill) {
    products = products.filter(p => p.skills.some((s: any) => s.name === filterSkill));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-3">
          Learning Kits
        </h1>
        <p className="text-stone-500 max-w-2xl text-lg mb-6">
          Expert-designed physical products paired with digital activities to accelerate your child&apos;s development.
        </p>
        
        {/* Skill Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!filterSkill ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            All Skills
          </Link>
          {allSkills?.map((skill: any) => (
            <Link
              key={skill.id}
              href={`/products?skill=${encodeURIComponent(skill.name)}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filterSkill === skill.name ? 'bg-amber-500 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {skill.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
          <div className="text-6xl mb-4">🐝</div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">Coming Soon</h2>
          <p className="text-stone-500">We are busy creating new learning kits. Check back later!</p>
        </div>
      )}
    </div>
  )
}
