
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'
import type { Product, Skill } from '@/types'

export const metadata: Metadata = {
  title: 'Products | HoneyBee Learning',
}

export default async function ProductsPage() {
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

  // Transform data
  const products = (productsData || []).map(p => ({
    ...p,
    skills: p.product_skills.map((ps: any) => ps.skills).filter(Boolean) as Skill[]
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-3">
          Learning Kits
        </h1>
        <p className="text-stone-500 max-w-2xl text-lg">
          Expert-designed physical products paired with digital activities to accelerate your child&apos;s development.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">Coming Soon</h2>
          <p className="text-stone-500">We are busy creating new learning kits. Check back later!</p>
        </div>
      )}
    </div>
  )
}
