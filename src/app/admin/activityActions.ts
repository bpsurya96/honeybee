/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveActivity(formData: FormData) {
  const supabase = await createAdminClient()
  
  const id = formData.get('id') as string
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const instructions = formData.get('instructions') as string
  
  
  const sequence_order = parseInt(formData.get('sequence_order') as string) || 0
  const age_min_months = parseInt(formData.get('age_min_months') as string) || 0
  const age_max_months = parseInt(formData.get('age_max_months') as string) || 60
  const active = formData.get('active') === 'on'
  const image_url = formData.get('image_url') as string
  
  const skillsJson = formData.get('skills') as string
  const skills = skillsJson ? JSON.parse(skillsJson) : []

  const activityData = {
    name, description, instructions, sequence_order, age_min_months, age_max_months, active, image_url
  }

  let activityId = id;

  if (id) {
    const { error } = await supabase.from('activities').update(activityData).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase.from('activities').insert(activityData).select('id').single()
    if (error) return { error: error.message }
    activityId = data.id
  }

  if (activityId) {
    await supabase.from('activity_skills').delete().eq('activity_id', activityId)
    if (skills.length > 0) {
      const skillInserts = skills.map((skillId: string) => ({
        activity_id: activityId,
        skill_id: skillId
      }))
      await supabase.from('activity_skills').insert(skillInserts)
    }
  }

  revalidatePath('/admin/activities')
  revalidatePath(`/activities/${activityId}`)

  
  return { success: true, id: activityId }
}

export async function deleteActivity(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('activities').update({ active: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/activities')
  return { success: true }
}

export async function getActivityData(id: string) {
  const supabase = await createAdminClient()
  const { data: activity } = await supabase.from('activities').select('*, activity_skills(skill_id)').eq('id', id).single()
  return activity
}

export async function getActiveProducts() {
  const supabase = await createAdminClient()
  const { data } = await supabase.from('products').select('id, name').eq('active', true).order('name')
  return data || []
}
