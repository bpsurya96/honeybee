'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
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

  async function handleGoogleLogin() {
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Google signup failed.')
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="font-display font-bold text-xl text-stone-900 mb-2">
          Check your email!
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed">
          We've sent a confirmation link to{' '}
          <strong className="text-stone-700">{email}</strong>. Click the link to
          activate your account.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-stone-500 font-medium">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold py-3 rounded-full transition-all shadow-sm hover:shadow"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <p className="text-xs text-stone-400 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}