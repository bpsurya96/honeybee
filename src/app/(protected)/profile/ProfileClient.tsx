'use client'
import { createClient } from '@/lib/supabase/client'
﻿
import { useState, useEffect } from 'react'
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
  
  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([])
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({ line1: '', city: '', state: '', pincode: '', phone: '', full_name: '' })

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    const supabase = createClient()
    const { data } = await supabase.from('addresses').select('*')
    if (data) setAddresses(data)
  }

  async function saveAddress(e: React.FormEvent) {
    const supabase = createClient()
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      if (addresses.length > 0) {
        await supabase.from('addresses').update({ ...addressForm }).eq('id', addresses[0].id)
      } else {
        await supabase.from('addresses').insert({ ...addressForm, parent_id: user.id })
      }
      await fetchAddresses()
      setEditingAddress(false)
    }
    setSaving(false)
  }

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

      {/* AI Credits â€” parent account-level balance */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-lg">âœ¨</div>
            <div>
              <p className="font-display font-bold text-stone-900">AI Credits</p>
              <p className="text-stone-500 text-xs">Account balance Â· used for AI Coach</p>
            </div>
          </div>
          <span className="text-[var(--color-fun-purple)] font-black text-xl bg-purple-50 px-4 py-2 btn-pill border border-purple-100">
            {((profile as any)?.ai_credit_accounts?.balance ?? 0)}
          </span>
        </div>
      </div>

      
      {/* Shipping Address */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-stone-900 text-lg">Shipping Address</h2>
          {!editingAddress && (
            <button onClick={() => {
              if (addresses[0]) {
                setAddressForm(addresses[0])
              }
              setEditingAddress(true)
            }} className="text-amber-600 text-sm font-semibold hover:underline">
              {addresses.length > 0 ? 'Edit' : 'Add Address'}
            </button>
          )}
        </div>
        
        {editingAddress ? (
          <form onSubmit={saveAddress} className="space-y-3">
            <input type="text" placeholder="Full Name" required value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
            <input type="text" placeholder="Phone" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
            <input type="text" placeholder="Street Address" required value={addressForm.line1} onChange={e => setAddressForm({...addressForm, line1: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
            <div className="flex gap-2">
              <input type="text" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-1/2 px-3 py-2 border rounded-xl" />
              <input type="text" placeholder="State" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-1/2 px-3 py-2 border rounded-xl" />
            </div>
            <input type="text" placeholder="Pincode" required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingAddress(false)} className="flex-1 py-2 text-stone-500 font-semibold border rounded-xl">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-xl">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        ) : (
          <div className="text-stone-600 text-sm">
            {addresses.length > 0 ? (
              <>
                <p className="font-semibold text-stone-800">{addresses[0].full_name}</p>
                <p>{addresses[0].line1}</p>
                <p>{addresses[0].city}, {addresses[0].state} {addresses[0].pincode}</p>
                <p>?? {addresses[0].phone}</p>
              </>
            ) : (
              <p className="text-stone-400 italic">No default address saved yet.</p>
            )}
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
