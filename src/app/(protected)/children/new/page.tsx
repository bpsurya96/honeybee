import type { Metadata } from 'next'
import ChildForm from '@/components/children/ChildForm'

export const metadata: Metadata = {
  title: 'Add Child',
}

export default function NewChildPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
        Add a child
      </h1>
      <p className="text-stone-500 mb-8">
        Tell us about your child so we can personalise their learning journey.
      </p>
      <ChildForm />
    </div>
  )
}
