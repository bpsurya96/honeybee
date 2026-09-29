
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, use } from 'react';
import { getCustomerDetails } from '../../../data';
import { Loader2, ArrowLeft, Mail, Phone, Calendar, CreditCard, Edit } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomerDetails(resolvedParams.id).then(data => {
      setCustomer(data);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-amber-500" /></div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/customers" className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
        </div>
        <Link href={`/admin/customers/${resolvedParams.id}/edit`} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center">
          <Edit className="w-4 h-4 mr-2" /> Edit Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parent Details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-1">
          <div className="flex flex-col items-center pb-6 border-b border-gray-100">
            <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-3xl font-bold mb-4">
              {customer.full_name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{customer.full_name || 'Unknown'}</h2>
            <p className="text-sm text-gray-500">Parent Account</p>
          </div>
          <div className="pt-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600"><Mail className="w-4 h-4 mr-3 text-gray-400"/> {customer.email}</div>
            <div className="flex items-center text-sm text-gray-600"><Phone className="w-4 h-4 mr-3 text-gray-400"/> {customer.phone || 'N/A'}</div>
            <div className="flex items-center text-sm text-gray-600"><Calendar className="w-4 h-4 mr-3 text-gray-400"/> Joined {new Date(customer.created_at).toLocaleDateString()}</div>
            <div className="flex items-center text-sm text-gray-600"><CreditCard className="w-4 h-4 mr-3 text-indigo-400"/> {customer.ai_credits} AI Credits</div>
          </div>
        </div>

        {/* Children Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Children Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.children?.map((child: any) => (
                <div key={child.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col space-y-3 hover:border-amber-200 transition-colors relative group">
                  <Link href={`/admin/customers/${resolvedParams.id}/children/${child.id}/edit`} className="absolute top-2 right-2 p-2 bg-white border border-gray-100 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </Link>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-4">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{child.name}</div>
                      <div className="text-sm text-gray-500">{child.gender || 'Not specified'} • {child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString() : 'No DOB'}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 block">Products</span>
                      <span className="font-semibold text-gray-900">{child.child_products?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Activities</span>
                      <span className="font-semibold text-gray-900">{child.child_activities?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!customer.children || customer.children.length === 0) && (
                <div className="text-sm text-gray-500 col-span-2">No children profiles found.</div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customer.orders?.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-sm font-medium text-amber-600">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.id.split('-')[0]}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium capitalize">{order.delivery_status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-bold">$${Number(order.total).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!customer.orders || customer.orders.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500 text-sm">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
