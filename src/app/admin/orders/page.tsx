import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Order Management | HoneyBee Admin',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-900 mb-1">Orders</h1>
          <p className="text-stone-500">Manage customer orders, view status and payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Delivery To</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-stone-600">
                    {order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">{order.profiles?.full_name || 'N/A'}</div>
                    
                    <div className="text-xs text-stone-400 mt-1">{order.mobile_number}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-sm text-stone-600" title={`${order.delivery_address}, ${order.delivery_city}, ${order.delivery_state} ${order.delivery_pincode}`}>
                    {order.delivery_city}, {order.delivery_state}
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">
                    ?{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      order.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-stone-500">
                    No orders found.
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
