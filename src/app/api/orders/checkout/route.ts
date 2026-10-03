import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendOrderNotifications } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      child_ids,
      shipping_name,
      shipping_phone,
      shipping_line1,
      shipping_city,
      shipping_state,
      shipping_pincode,
      items
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify children belong to parent
    const validChildIds = [];
    if (child_ids && Array.isArray(child_ids)) {
      for (const cid of child_ids) {
        if (cid === 'gift') continue;
        const { data: childData } = await supabase
          .from('children')
          .select('id')
          .eq('id', cid)
          .eq('parent_id', user.id)
          .single();
        if (childData) validChildIds.push(childData.id);
      }
    }

    // Calculate total from DB prices to prevent tampering
    let subtotal = 0;
    const validatedItems = [];

    // Use admin client to read active products bypassing user RLS constraints if any
    const adminSupabase = await createAdminClient();

    for (const item of items) {
      const { data: productData, error: productError } = await adminSupabase
        .from('products')
        .select('id, price, name')
        .eq('id', item.product_id)
        .single();

      if (productError || !productData) {
        return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
      }

      const itemTotal = productData.price * item.quantity;
      subtotal += itemTotal;
      
      validatedItems.push({
        product_id: productData.id,
        product_name: productData.name,
        quantity: item.quantity,
        unit_price: productData.price
      });
    }

    const total = subtotal; // add shipping logic if any
    
    // Generate idempotency key for safe retries
    const idempotencyKey = `chk-${user.id}-${Date.now()}`;

    // Execute atomic order transaction
    const { data: orderId, error: txError } = await adminSupabase.rpc('create_order_transaction', {
      p_parent_id: user.id,
      p_idempotency_key: idempotencyKey,
      p_shipping_name: shipping_name || 'N/A',
      p_shipping_phone: shipping_phone || 'N/A',
      p_shipping_line1: shipping_line1 || 'N/A',
      p_shipping_city: shipping_city || 'N/A',
      p_shipping_state: shipping_state || 'N/A',
      p_shipping_pincode: shipping_pincode || 'N/A',
      p_subtotal: subtotal,
      p_total: total,
      p_items: validatedItems,
      p_child_ids: validChildIds
    });

    if (txError) {
      console.error('Order creation failed:', txError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Fetch parent info for notifications
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Trigger Notifications
    await sendOrderNotifications({
      orderId: orderId,
      parentName: profile?.full_name || 'Parent',
      childName: validChildIds.length > 0 ? 'Assigned Children' : 'Gift',
      mobileNumber: shipping_phone,
      deliveryAddress: `${shipping_line1}, ${shipping_city}, ${shipping_state} - ${shipping_pincode}`,
      booksOrdered: validatedItems.map((item: any) => ({ name: item.product_name, quantity: item.quantity })),
      totalAmount: total,
      paymentStatus: 'pending'
    });

    return NextResponse.json({ data: { id: orderId } });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}