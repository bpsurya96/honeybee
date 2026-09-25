'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">??</div>
        <h2 className="font-display font-bold text-xl text-stone-900 mb-2">
          Check your email!
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          We&apos;ve sent a confirmation link to{' '}
          <strong className="text-stone-700">{email}</strong>. Click the link to
          activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold text-stone-700 mb-1.5"
        >
          Your name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 placeholder:text-stone-400 bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-stone-700 mb-1.5"
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 placeholder:text-stone-400 bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-stone-700 mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 placeholder:text-stone-400 bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create Free Account'}
      </button>

      <p className="text-xs text-stone-400 text-center">
        By creating an account, you agree to our Terms of Service and Privacy
        Policy.
      </p>
    </form>
  )
}
