
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import type { Order } from '@/types'
import SeedOrderButton from './SeedOrderButton'

export const metadata: Metadata = {
  title: 'My Orders | HoneyBee Learning',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(count)
    `)
    .eq('parent_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <Package size={24} />
        </div>
        <h1 className="text-3xl font-display font-black text-stone-900">My Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <div className="text-6xl mb-4">???</div>
          <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">No orders yet</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            You haven't placed any orders. Browse our learning kits to start your child's journey!
          </p>
          <Link href="/products" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md inline-block">
            Browse Kits
          </Link>
          <SeedOrderButton />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link 
              key={order.id} 
              href={`/orders/${order.id}`}
              className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div>
                <p className="text-stone-500 text-sm mb-1">
                  Order placed {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display font-bold text-lg text-stone-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-stone-600 text-sm font-medium">
                  {order.items[0].count} item{order.items[0].count !== 1 ? 's' : ''} � Total: �{order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-0 border-stone-100 pt-4 md:pt-0 mt-2 md:mt-0">
                <span className={`text-sm font-semibold ${
                  order.delivery_status === 'delivered' ? 'text-emerald-600' : 
                  order.delivery_status === 'shipped' ? 'text-amber-600' : 'text-stone-500'
                }`}>
                  Status: {order.delivery_status.charAt(0).toUpperCase() + order.delivery_status.slice(1)}
                </span>
                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
