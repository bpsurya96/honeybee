import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your HoneyBee Learning account.',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/80 p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">??</div>
          <h1 className="text-2xl font-display font-black text-stone-900 mb-1">
            Welcome back!
          </h1>
          <p className="text-stone-500 text-sm">
            Sign in to continue your learning journey
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-stone-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-amber-600 font-semibold hover:text-amber-700 transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
