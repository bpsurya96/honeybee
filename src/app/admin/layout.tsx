import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (!admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/" className="font-display font-black text-2xl text-white">
            HoneyBee<span className="text-amber-400">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded-xl bg-stone-800 text-white font-semibold">
            Dashboard
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded-xl hover:bg-stone-800 hover:text-white transition-colors">
            Orders
          </Link>
          <Link href="/admin/users" className="block px-4 py-2 rounded-xl hover:bg-stone-800 hover:text-white transition-colors">
            Customers
          </Link>
          <Link href="/admin/products" className="block px-4 py-2 rounded-xl hover:bg-stone-800 hover:text-white transition-colors">
            Products
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-800">
          <Link href="/dashboard" className="text-sm hover:text-white">? Back to App</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
