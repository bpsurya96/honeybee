'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { Profile } from '@/types'

interface ProfileClientProps {
  profile: Profile | null
  email: string
  createdAt: string
}

export default function ProfileClient({ profile, email, createdAt }: ProfileClientProps) {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  async function handleAvatarUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target', 'parent')
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    success('Avatar updated!')
    router.refresh()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      })
      if (res.ok) {
        success('Profile saved!')
        setIsEditing(false)
        router.refresh()
      } else {
        showError('Could not save profile.')
      }
    } catch {
      showError('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : ''

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <AvatarUpload
            currentUrl={profile?.avatar_url}
            name={profile?.full_name || email}
            onUpload={handleAvatarUpload}
            size="lg"
          />
          <div>
            <p className="font-display font-bold text-xl text-stone-900">
              {profile?.full_name || 'Add your name'}
            </p>
            <p className="text-stone-500 text-sm">{email}</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors mt-1"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="space-y-4 border-t border-stone-100 pt-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-stone-700 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all text-stone-900 bg-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setFullName(profile?.full_name || '') }}
                className="flex-1 border-2 border-stone-200 text-stone-600 font-semibold py-2.5 rounded-full hover:bg-stone-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-2.5 rounded-full transition-all text-sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Info */}
        {!isEditing && (
          <div className="space-y-0 text-sm border-t border-stone-100 pt-4">
            <div className="flex justify-between py-3 border-b border-stone-50">
              <span className="text-stone-500">Email</span>
              <span className="font-medium text-stone-700">{email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-stone-500">Member since</span>
              <span className="font-medium text-stone-700">{memberSince}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          className="w-full border-2 border-red-200 text-red-600 font-semibold py-3 rounded-full hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </form>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
