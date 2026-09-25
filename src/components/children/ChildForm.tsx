'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ChildFormProps {
  initialData?: {
    id: string
    name: string
    date_of_birth: string
    gender: string | null
  }
}

export default function ChildForm({ initialData }: ChildFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [name, setName] = useState(initialData?.name || '')
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || '')
  const [gender, setGender] = useState(initialData?.gender || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError("Please enter your child's name.")
      return
    }
    if (!dateOfBirth) {
      setError("Please enter your child's date of birth.")
      return
    }

    // Validate DOB is not in the future
    const dob = new Date(dateOfBirth)
    if (dob > new Date()) {
      setError("Date of birth cannot be in the future.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const childData = {
        name: name.trim(),
        date_of_birth: dateOfBirth,
        gender: gender || null,
        parent_id: user.id,
      }

      let error

      if (isEditing && initialData) {
        const result = await supabase
          .from('children')
          .update(childData)
          .eq('id', initialData.id)
          .eq('parent_id', user.id)
        error = result.error
      } else {
        const result = await supabase.from('children').insert(childData)
        error = result.error
      }

      if (error) {
        setError(error.message)
        return
      }

      router.push('/children')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="childName"
            className="block text-sm font-semibold text-stone-700 mb-1.5"
          >
            Child&apos;s name <span className="text-red-500">*</span>
          </label>
          <input
            id="childName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav"
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 placeholder:text-stone-400 bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-semibold text-stone-700 mb-1.5"
          >
            Date of birth <span className="text-red-500">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            required
            value={dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-semibold text-stone-700 mb-1.5"
          >
            Gender <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Boy</option>
            <option value="female">Girl</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border-2 border-stone-200 text-stone-600 font-semibold py-3 rounded-full hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 rounded-full transition-all shadow-md disabled:cursor-not-allowed"
          >
            {loading
              ? isEditing
                ? 'Saving...'
                : 'Adding...'
              : isEditing
              ? 'Save Changes'
              : 'Add Child'}
          </button>
        </div>
      </form>
    </div>
  )
}
