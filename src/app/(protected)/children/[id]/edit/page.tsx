import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChildForm from '@/components/children/ChildForm'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Child',
}

export default async function EditChildPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .eq('parent_id', user.id)
    .single()

  if (!child) notFound()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href={`/children/${child.id}`}
        className="text-stone-500 hover:text-stone-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
      >
        ← Back to {child.name}
      </Link>
      <h1 className="text-3xl font-display font-black text-stone-900 mb-2 mt-2">
        Edit {child.name}
      </h1>
      <p className="text-stone-500 mb-8">Update {child.name}&apos;s details.</p>
      <ChildForm
        initialData={{
          id: child.id,
          name: child.name,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
        }}
      />
    </div>
  )
}
