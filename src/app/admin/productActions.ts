/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveProduct(formData: FormData) {
  const supabase = await createAdminClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string || ('prod-' + Date.now().toString())
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const age_min_months = parseInt(formData.get('age_min_months') as string)
  const age_max_months = parseInt(formData.get('age_max_months') as string)
  const image_url = formData.get('image_url') as string
  const active = formData.get('active') === 'on'
  
  const skillsJson = formData.get('skills') as string
  const skills = skillsJson ? JSON.parse(skillsJson) : []
  const actsJson = formData.get('activities') as string
  const activities = actsJson ? JSON.parse(actsJson) : []

  const productData = {
    name, slug, description, price, age_min_months, age_max_months, image_url, active
  }

  let productId = id;

  if (id) {
    // Update
    const { error } = await supabase.from('products').update(productData).eq('id', id)
    if (error) return { error: error.message }
  } else {
    // Create
    const { data, error } = await supabase.from('products').insert(productData).select('id').single()
    if (error) return { error: error.message }
    productId = data.id
  }

  // Update skills
  if (productId) {
    // Clear old activities linked to this product
    await supabase.from('activities').update({ product_id: null }).eq('product_id', productId)
    if (activities.length > 0) {
      await supabase.from('activities').update({ product_id: productId }).in('id', activities)
    }

    await supabase.from('product_skills').delete().eq('product_id', productId)
    if (skills.length > 0) {
      const skillInserts = skills.map((skillId: string) => ({
        product_id: productId,
        skill_id: skillId
      }))
      await supabase.from('product_skills').insert(skillInserts)
    }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)
  
  return { success: true, id: productId }
}

export async function deleteProduct(id: string) {
  const supabase = await createAdminClient()
  
  // Soft delete by setting active to false to preserve order history
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { success: true }
}

export async function getAllSkills() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('skills').select('*, category:skill_categories(*)').order('name')
  return data || []
}

export async function getProductData(id: string) {
  const supabase = await createAdminClient()
  const { data: product } = await supabase.from('products').select('*, product_skills(skill_id), activities(id)').eq('id', id).single()
  return product
}

export async function getAllActivities() {
  const supabase = await createAdminClient();
  const { data } = await supabase.from('activities').select('id, name, product_id').order('name');
  return data || [];
}

export async function createQuickSkill(name: string) {
  const supabase = await createAdminClient();
  let { data: cat } = await supabase.from('skill_categories').select('id').eq('name', 'Custom').single();
  if (!cat) {
    const { data: newCat } = await supabase.from('skill_categories').insert({
      name: 'Custom', description: 'Custom added skills', display_order: 99
    }).select('id').single();
    cat = newCat;
  }
  const { data: skill, error } = await supabase.from('skills').insert({
    name, category_id: cat?.id, active: true
  }).select('*').single();
  
  if (error) return { error: error.message };
  return { success: true, skill };
}
