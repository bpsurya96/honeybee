import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Admin Dashboard | HoneyBee',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch basic stats
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { data: revenueData } = await supabase.from('orders').select('total').eq('payment_status', 'completed')
  const totalRevenue = revenueData?.reduce((acc, order) => acc + order.total, 0) || 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      payment_status,
      created_at,
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-black text-stone-900">Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 font-semibold mb-1">Total Customers</p>
          <p className="text-4xl font-black text-stone-900">{usersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 font-semibold mb-1">Total Orders</p>
          <p className="text-4xl font-black text-stone-900">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 font-semibold mb-1">Total Revenue</p>
          <p className="text-4xl font-black text-[var(--color-fun-red)]">?{(totalRevenue).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-stone-500 hover:text-stone-900">
            View All ?
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-stone-600">
                    {order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-900">{order.profiles?.full_name || 'N/A'}</div>
                    
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
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
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
