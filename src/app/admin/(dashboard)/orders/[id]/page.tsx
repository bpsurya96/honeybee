/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderDetails, saveOrder } from '../../../orderActions';
import { Loader2, ArrowLeft, Save, ShoppingBag, Truck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrderDetails(resolvedParams.id).then(data => {
      setOrder(data);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append('id', resolvedParams.id);
    const res = await saveOrder(formData);
    setSaving(false);
    if (res.error) alert(res.error);
    else {
      alert('Order updated successfully');
      router.refresh();
    }
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;
  if (!order) return <div>Order not found</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/orders" className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order Details & Fulfillment</h1>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center text-sm shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Update Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><ShoppingBag className="w-5 h-5 mr-2 text-amber-500"/> Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-bold text-gray-500 pb-3">Product</th>
                    <th className="text-center text-xs font-bold text-gray-500 pb-3">Qty</th>
                    <th className="text-right text-xs font-bold text-gray-500 pb-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-4 text-sm text-gray-900 font-medium">{item.product?.name || item.product_name}</td>
                      <td className="py-4 text-sm text-gray-500 text-center">{item.quantity}</td>
                      <td className="py-4 text-sm font-bold text-gray-900 text-right">&#8377;{Number(item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="py-4 text-right text-sm font-bold text-gray-500">Total:</td>
                    <td className="py-4 text-right text-lg font-black text-gray-900">&#8377;{Number(order.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-500"/> Delivery Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" name="shipping_line1" defaultValue={order.shipping_line1} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="shipping_city" defaultValue={order.shipping_city} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="shipping_state" defaultValue={order.shipping_state} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input type="text" name="shipping_pincode" defaultValue={order.shipping_pincode} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Mobile</label>
                <input type="text" name="shipping_phone" defaultValue={order.shipping_phone} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center"><Truck className="w-5 h-5 mr-2 text-indigo-500"/> Status Update</h2>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                 <select name="status" defaultValue={order.status} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 capitalize bg-gray-50">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                 <select name="payment_status" defaultValue={order.payment_status} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 capitalize bg-gray-50">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="partially_refunded">Partially Refunded</option>
                 </select>
               </div>
               
               <div className="pt-5 border-t border-gray-100 mt-5">
                  <p className="text-sm text-gray-500 flex justify-between items-center"><strong className="text-gray-900">Customer:</strong> <Link href={`/admin/customers/${order.parent_id}`} className="text-indigo-600 hover:underline">{order.profiles?.full_name}</Link></p>
                  {order.order_children && order.order_children.length > 0 && <p className="text-sm text-gray-500 flex justify-between mt-2"><strong className="text-gray-900">Child:</strong> {order.order_children[0].children?.name}</p>}
                  <p className="text-sm text-gray-500 flex justify-between mt-2"><strong className="text-gray-900">Order ID:</strong> <span className="font-mono text-xs">{order.id}</span></p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </form>
  );
}