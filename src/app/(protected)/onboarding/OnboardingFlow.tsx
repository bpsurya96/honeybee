'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface OnboardingFlowProps {
  firstName: string
}

export default function OnboardingFlow({ firstName }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError("Please enter your child's name."); return }
    if (!dateOfBirth) { setError("Please enter your child's date of birth."); return }
    if (new Date(dateOfBirth) > new Date()) { setError("Date of birth cannot be in the future."); return }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { error } = await supabase.from('children').insert({
        name: name.trim(),
        date_of_birth: dateOfBirth,
        gender: gender || null,
        parent_id: user.id,
      })

      if (error) { setError(error.message); return }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-amber-500' : 'bg-amber-200'}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="text-center animate-fade-in">
            <div className="text-7xl mb-4">??</div>
            <h1 className="text-3xl font-display font-black text-stone-900 mb-3">
              Welcome, {firstName}!
            </h1>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed">
              You are about to start your child&apos;s personalised learning journey.
              <br />Let&apos;s begin by adding your first child.
            </p>
            <button
              onClick={() => setStep(2)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full"
            >
              Add My First Child ?
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button onClick={() => setStep(1)} className="text-stone-500 hover:text-stone-700 text-sm font-medium mb-4 inline-flex items-center gap-1">
              ? Back
            </button>
            <h2 className="text-2xl font-display font-black text-stone-900 mb-1">Tell us about your child</h2>
            <p className="text-stone-500 mb-6 text-sm">This helps us personalise their learning journey.</p>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <form onSubmit={handleCreate} className="space-y-5" noValidate>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
                )}
                <div>
                  <label htmlFor="childName" className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Child&apos;s name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="childName" type="text" required autoFocus value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Date of birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dob" type="date" required value={dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-stone-700 mb-1.5">
                    Gender <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <select
                    id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Boy</option>
                    <option value="female">Girl</option>
                  </select>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 rounded-full transition-all shadow-md disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Start Learning Journey ?'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
