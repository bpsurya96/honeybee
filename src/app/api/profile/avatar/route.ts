import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const target = formData.get('target') as string | null // 'parent' | child id

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum 5MB.' }, { status: 400 })
  }

  const isParent = !target || target === 'parent'
  const folder = isParent ? user.id : `${user.id}/children/${target}`
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folder}/avatar.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  // Update the appropriate record
  if (isParent) {
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
  } else {
    // Verify child belongs to parent before updating
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', target)
      .eq('parent_id', user.id)
      .single()
    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    await supabase.from('children').update({ avatar_url: publicUrl }).eq('id', target).eq('parent_id', user.id)
  }

  return NextResponse.json({ data: { url: publicUrl } })
}
