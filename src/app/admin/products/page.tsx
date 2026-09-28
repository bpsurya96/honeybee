import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Product Management | HoneyBee Admin',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      activities (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-900 mb-1">Products</h1>
          <p className="text-stone-500">Manage learning kits, their age ranges, and mapped activities.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Age Range</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Activities</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products?.map((product: any) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">
                    ?{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {product.min_age_months} - {product.max_age_months} mo
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      product.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center bg-stone-100 text-stone-700 font-bold rounded-full px-3 py-1">
                      {product.activities?.[0]?.count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4" target="_blank">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
