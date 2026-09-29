
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '../actions';
import { LayoutDashboard, Users, Package, Activity, LogOut, Leaf, ShoppingCart, Settings } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('honeybee_admin_session');

  if (!session || session.value !== 'authenticated') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-amber-500 text-white">
          <Leaf className="h-6 w-6 text-white mr-2" />
          <span className="text-xl font-bold">HoneyBee</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Overview</p>
          <Link href="/admin" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Management</p>
          <Link href="/admin/customers" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <Users className="h-5 w-5 mr-3" />
            Customers
          </Link>
          <Link href="/admin/orders" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <ShoppingCart className="h-5 w-5 mr-3" />
            Orders
          </Link>
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Content</p>
          <Link href="/admin/products" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <Package className="h-5 w-5 mr-3" />
            Products
          </Link>
          <Link href="/admin/activities" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <Activity className="h-5 w-5 mr-3" />
            Activities
          </Link>
          <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">System</p>
          <Link href="/admin/settings" className="flex items-center px-2 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors font-medium">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action={adminLogout}>
            <button type="submit" className="flex items-center w-full px-2 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium">
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
