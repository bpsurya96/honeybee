import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Customer Management | HoneyBee Admin',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      children (count),
      orders (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-900 mb-1">Customers</h1>
          <p className="text-stone-500">View registered parents, their children counts, and AI credits.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Parent Name</th>
                                <th className="px-6 py-4">Children</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">AI Credits</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900">
                    {user.full_name || 'Unnamed Parent'}
                  </td>
                                    <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center bg-stone-100 text-stone-700 font-bold rounded-full w-8 h-8">
                      {user.children?.[0]?.count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">
                    {user.orders?.[0]?.count || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-sm">
                      ? {user.ai_credits || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                    No customers found.
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
