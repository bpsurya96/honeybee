import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 });

    // 1. Verify order belongs to parent
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('parent_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ message: 'Order already paid' });
    }

    // 2. Mark order as paid
    await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'processing' })
      .eq('id', order_id);

    // 3. Mark AI credits as completed (if any exist for this order)
    await supabase
      .from('ai_credit_transactions')
      .update({ status: 'completed' })
      .eq('order_id', order_id);

    // 4. Fetch Order Items to assign child products
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id)
      .eq('is_gift', false); // Only assign non-gifts

    if (items && items.length > 0) {
      const childProductsData = items.map(item => ({
        child_id: item.recipient_child_id,
        product_id: item.product_id,
        order_item_id: item.id,
        active: true
      }));

      // Ignore conflicts (e.g., if child already owns it, handle gracefully or let DB throw constraint error)
      // The DB schema enforces UNIQUE(child_id, product_id)
      for (const cp of childProductsData) {
        if (cp.child_id) {
          await supabase.from('child_products').upsert({
            child_id: cp.child_id,
            product_id: cp.product_id,
            order_item_id: cp.order_item_id,
            active: true
          }, { onConflict: 'child_id, product_id' });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Payment simulated and products assigned.' });
  } catch (err: any) {
    console.error('Simulation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
