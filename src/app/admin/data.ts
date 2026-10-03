/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getAdminStats() {
  const supabase = await createAdminClient()
  
  const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: childrenCount } = await supabase.from('children').select('*', { count: 'exact', head: true })
  const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: activitiesCount } = await supabase.from('activities').select('*', { count: 'exact', head: true })
  const { count: completedActivitiesCount } = await supabase.from('child_activities').select('*', { count: 'exact', head: true }).eq('completed', true)

  const { data: orders } = await supabase.from('orders').select('total, status, payment_status, created_at')
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
  const pendingPayments = orders?.filter(o => o.payment_status === 'pending').length || 0

  const { data: creditTxs } = await supabase.from('ai_credit_transactions').select('amount')
  // For issued we only count positive (awards)
  const totalCreditsIssued = creditTxs?.reduce((sum, tx) => sum + (Number(tx.amount) > 0 ? Number(tx.amount) : 0), 0) || 0
  
  const { data: orderItems } = await supabase.from('order_items').select('quantity')
  const totalBooksSold = orderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0

  // Basic monthly grouping
  const salesData = []
  if (orders) {
    const grouped = orders.reduce((acc, order) => {
      const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
      if (!acc[month]) acc[month] = { sales: 0, revenue: 0 };
      acc[month].sales += 1;
      acc[month].revenue += Number(order.total);
      return acc;
    }, {} as Record<string, {sales: number, revenue: number}>);
    for (const [name, data] of Object.entries(grouped)) {
      salesData.push({ name, sales: (data as any).sales, revenue: (data as any).revenue });
    }
  }

  // Calculate real top products from order_items
  const { data: allOrderItems } = await supabase.from('order_items').select('product_id, quantity, products(name)')
  const productSales: Record<string, {name: string, sales: number}> = {}
  if (allOrderItems) {
    for (const item of allOrderItems) {
      const pid = item.product_id
      if (!productSales[pid]) {
        productSales[pid] = { name: (item as any).products?.name || 'Unknown', sales: 0 }
      }
      productSales[pid].sales += Number(item.quantity)
    }
  }
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      sales: p.sales,
      category: 'Developmental Kit'
    }))

  return {
    totalRevenue: `$${totalRevenue.toFixed(2)}`,
    totalOrders: ordersCount || 0,
    activeParents: usersCount || 0,
    totalChildren: childrenCount || 0,
    kitsSold: totalBooksSold || 0,
    pendingOrders,
    completedOrders,
    pendingPayments,
    totalActivities: activitiesCount || 0,
    completedActivities: completedActivitiesCount || 0,
    totalCreditsIssued,
    salesData,
    topProducts
  }
}

export async function getCustomers() {
  const supabase = await createAdminClient()
  
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  
  const { data: profiles } = await supabase.from('profiles').select(`
    id, full_name, avatar_url, created_at,
    ai_credit_accounts ( balance ),
    children ( id, name, date_of_birth, gender ),
    orders ( id, total, status, created_at )
  `)

  return profiles?.map(profile => {
    const authUser = authUsers?.users.find(u => u.id === profile.id)
    const totalSpent = profile.orders.reduce((sum, o) => sum + Number(o.total), 0)
    
    return {
      id: profile.id,
      name: profile.full_name || 'Unknown User',
      email: authUser?.email || 'No email',
      phone: authUser?.phone || 'No phone',
      ai_credits: profile.ai_credit_accounts?.[0]?.balance || 0,
      created_at: profile.created_at,
      total_spent: totalSpent,
      children: profile.children.map((c: any) => ({
        id: c.id,
        name: c.name,
        dob: c.date_of_birth,
        age: calculateAge(c.date_of_birth)
      })),
      orders: profile.orders.map((o: any) => ({
        id: o.id.split('-')[0],
        date: new Date(o.created_at).toISOString().split('T')[0],
        total: `$${Number(o.total).toFixed(2)}`,
        status: o.status
      }))
    }
  }) || []
}

export async function getCustomerDetails(id: string) {
  const supabase = await createAdminClient()
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const authUser = authUsers?.users.find(u => u.id === id)
  
  const { data: profile } = await supabase.from('profiles').select(`
    *,
    ai_credit_accounts ( balance ),
    children ( *, child_activities(*, activities(*)), child_products(*, order_items(product_id, products(*))) ),
    orders ( *, order_items(*, products(*)) ),
    ai_credit_transactions(*)
  `).eq('id', id).single()

  if (!profile) return null;
  
  return {
    ...profile,
    email: authUser?.email,
    phone: authUser?.phone
  }
}

function calculateAge(dob: string) {
  if(!dob) return 'Unknown';
  const diff = Date.now() - new Date(dob).getTime();
  const age = new Date(diff); 
  const years = Math.abs(age.getUTCFullYear() - 1970);
  return years === 0 ? '< 1 year' : `${years} years`;
}

export async function getProducts() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('products').select('*, product_skills(skills(*))').order('created_at', { ascending: false })
  return data || []
}

export async function getActivities() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('activities').select('*, product:products(name), activity_skills(skills(*))').order('created_at', { ascending: false })
  return data || []
}

export async function getOrders() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('orders').select('*, order_children(child_id, children(*)), profiles(full_name), items:order_items(*, product:products(*))').order('created_at', { ascending: false })
  return data || []
}