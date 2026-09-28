import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NEW_BOOK_AI_CREDIT } from '@/lib/config';
import { sendOrderNotifications } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Missing items' }, { status: 400 });
    }

    let subtotal = 0;
    const orderItemsToInsert = [];
    let hasNewBook = false;

    // Validate all items and children
    for (const item of items) {
      if (!item.is_gift && !item.recipient_child_id) {
        return NextResponse.json({ error: 'Non-gift items must have a recipient child' }, { status: 400 });
      }

      if (item.recipient_child_id) {
        // Verify child belongs to parent
        const { data: childData } = await supabase
          .from('children')
          .select('id')
          .eq('id', item.recipient_child_id)
          .eq('parent_id', user.id)
          .single();
        if (!childData) {
          return NextResponse.json({ error: 'Invalid child selected' }, { status: 400 });
        }
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, price, name')
        .eq('id', item.product_id)
        .single();

      if (productError || !productData) {
        return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
      }

      const itemTotal = productData.price * item.quantity;
      subtotal += itemTotal;
      
      orderItemsToInsert.push({
        product_id: productData.id,
        quantity: item.quantity,
        unit_price: productData.price,
        is_gift: item.is_gift || false,
        recipient_child_id: item.is_gift ? null : item.recipient_child_id,
        name: productData.name
      });

      hasNewBook = true;
    }

    const total = subtotal;

    // Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        parent_id: user.id,
        mobile_number,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_pincode,
        subtotal,
        total,
        status: 'new',
        payment_status: 'pending',
        delivery_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation failed:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create Order Items
    const orderItemsData = orderItemsToInsert.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      is_gift: item.is_gift,
      recipient_child_id: item.recipient_child_id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError);
    }

    if (hasNewBook) {
      await supabase
        .from('ai_credit_transactions')
        .insert({
          parent_id: user.id,
          order_id: order.id,
          amount: NEW_BOOK_AI_CREDIT,
          reason: 'New Book Purchase (Pending)',
          status: 'pending'
        });
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    await sendOrderNotifications({
      orderId: order.id,
      parentName: profile?.full_name || 'Parent',
      childName: 'Mixed/Gift',
      mobileNumber: mobile_number,
      deliveryAddress: `${delivery_address}, ${delivery_city}, ${delivery_state} - ${delivery_pincode}`,
      booksOrdered: orderItemsToInsert,
      totalAmount: total,
      paymentStatus: order.payment_status
    }).catch(console.error);

    return NextResponse.json({ data: order });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
