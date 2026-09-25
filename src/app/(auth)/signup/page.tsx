import type { Metadata } from 'next'
import Link from 'next/link'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your free HoneyBee Learning account.',
}

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/80 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-display font-black text-stone-900 mb-1">
            Start your journey
          </h1>
          <p className="text-stone-500 text-sm">
            Create your free account Ã‚â€” it takes 30 seconds
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
