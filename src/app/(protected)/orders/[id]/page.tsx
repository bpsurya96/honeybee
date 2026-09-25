
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ChildAssignmentClient from './ChildAssignmentClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Order Details | HoneyBee Learning',
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*),
        assignment:child_products(child_id)
      )
    `)
    .eq('id', id)
    .eq('parent_id', user!.id)
    .single()

  if (!order) notFound()

  // Fetch children for assignment dropdowns
  const { data: children } = await supabase
    .from('children')
    .select('id, name, avatar_url')
    .eq('parent_id', user!.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        href="/orders"
        className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Orders
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 mb-6">
        <div className="p-6 md:p-8 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-black text-stone-900 mb-1">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-stone-500">
              Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block text-center ${
              order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'
            }`}>
              Payment: {order.status}
            </span>
            <span className={`text-sm font-semibold ${
              order.delivery_status === 'delivered' ? 'text-emerald-600' : 
              order.delivery_status === 'shipped' ? 'text-amber-600' : 'text-stone-500'
            }`}>
              Delivery: {order.delivery_status.charAt(0).toUpperCase() + order.delivery_status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-stone-50/50">
          <h2 className="font-display font-bold text-lg text-stone-900 mb-4">Assign Learning Kits</h2>
          <p className="text-stone-600 text-sm mb-6">
            Assign purchased kits to your children so they appear in their personal library and unlock digital activities.
          </p>
          
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <ChildAssignmentClient 
                key={item.id} 
                item={item} 
                childrenList={children || []} 
              />
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-stone-100">
          <div className="flex justify-between items-center text-lg mb-2">
            <span className="text-stone-600">Subtotal</span>
            <span className="font-semibold text-stone-900">�{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg mb-4">
            <span className="text-stone-600">Shipping</span>
            <span className="font-semibold text-stone-900">�0.00</span>
          </div>
          <div className="flex justify-between items-center text-2xl border-t border-stone-200 pt-4">
            <span className="font-display font-bold text-stone-900">Total</span>
            <span className="font-display font-black text-amber-600">�{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
