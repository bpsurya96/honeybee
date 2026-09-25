import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-6">
        My Profile
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl font-display font-black text-amber-600">
            {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-stone-900">
              {profile?.full_name || 'Update your name'}
            </p>
            <p className="text-stone-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-3 border-b border-stone-100">
            <span className="text-stone-500">Email</span>
            <span className="font-medium text-stone-700">{user?.email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-stone-100">
            <span className="text-stone-500">Member since</span>
            <span className="font-medium text-stone-700">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Â—'}
            </span>
          </div>
        </div>
      </div>

      <form action="/api/auth/signout" method="post" className="mt-8">
        <button
          type="submit"
          className="w-full border-2 border-red-200 text-red-600 font-semibold py-3 rounded-full hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}
