import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Products',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
        Learning Products
      </h1>
      <p className="text-stone-500 mb-8">
        Browse our curated collection of early learning products.
      </p>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 h-40 flex items-center justify-center text-6xl">??</div>
              <div className="p-5">
                <h3 className="font-display font-bold text-stone-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-stone-500 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 font-bold text-lg">
                    Ã‚�{product.price.toFixed(2)}
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {Math.floor(product.age_min_months / 12)}Ã‚â€“
                    {Math.ceil(product.age_max_months / 12)} yrs
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">??</div>
          <h2 className="text-xl font-display font-bold text-stone-900 mb-2">
            Products coming soon
          </h2>
          <p className="text-stone-500">
            Run the seed data to populate products, or connect your Supabase database.
          </p>
        </div>
      )}
    </div>
  )
}
