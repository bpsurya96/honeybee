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
    const { child_id, mobile_number, delivery_address, delivery_city, delivery_state, delivery_pincode, items } = body;

    if (!child_id || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify child belongs to parent
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('id, name')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single();

    if (childError || !childData) {
      return NextResponse.json({ error: 'Invalid child selected' }, { status: 400 });
    }

    // Calculate total from DB prices to prevent tampering
    let subtotal = 0;
    const orderItemsToInsert = [];
    let hasNewBook = false;

    for (const item of items) {
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
        name: productData.name // for notifications
      });

      // Assuming any purchase of products table is a new book
      hasNewBook = true;
    }

    const total = subtotal; // add shipping logic if any

    // Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        parent_id: user.id,
        child_id,
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
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items creation failed:', itemsError);
    }

    // Add AI Credit if applicable
    if (hasNewBook) {
      const { error: creditError } = await supabase
        .from('ai_credit_transactions')
        .insert({
          parent_id: user.id,
          order_id: order.id,
          amount: NEW_BOOK_AI_CREDIT,
          reason: 'New Book Purchase',
          status: 'completed'
        });
      
      if (creditError) {
        console.error('Failed to award AI credit:', creditError);
      }
    }

    // Fetch parent info for notifications
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Trigger Notifications
    await sendOrderNotifications({
      orderId: order.id,
      parentName: profile?.full_name || 'Parent',
      childName: childData.name,
      mobileNumber: mobile_number,
      deliveryAddress: `${delivery_address}, ${delivery_city}, ${delivery_state} - ${delivery_pincode}`,
      booksOrdered: orderItemsToInsert,
      totalAmount: total,
      paymentStatus: order.payment_status
    });

    return NextResponse.json({ data: order });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
