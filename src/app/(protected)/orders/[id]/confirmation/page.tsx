import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function OrderConfirmationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      children (name),
      order_items (quantity)
    `)
    .eq('id', id)
    .single();

  if (!order) {
    return <div>Order not found</div>;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', order.parent_id)
    .single();

  const totalBooks = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-sm">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-display font-black text-stone-900 mb-4">
          Order Placed Successfully
        </h1>
        
        <p className="text-lg text-stone-600 mb-8">
          Thank you, <span className="font-semibold">{profile?.full_name || 'Parent'}</span>.
        </p>
        
        <div className="bg-stone-50 rounded-2xl p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between border-b border-stone-200 pb-3">
            <span className="text-stone-500">Order Number:</span>
            <span className="font-bold text-stone-900">#ORD-{order.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-3">
            <span className="text-stone-500">Child:</span>
            <span className="font-semibold text-stone-900">{order.children?.name}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-3">
            <span className="text-stone-500">Books:</span>
            <span className="font-semibold text-stone-900">{totalBooks}</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-3">
            <span className="text-stone-500">Order Total:</span>
            <span className="font-bold text-amber-600">₹{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-stone-500">Payment:</span>
            <span className="font-semibold text-stone-900 capitalize">{order.payment_status}</span>
          </div>
        </div>
        
        <p className="text-stone-500 text-sm mb-8">
          Our team will contact you shortly to complete the payment.
        </p>

        <Link 
          href="/dashboard"
          className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
