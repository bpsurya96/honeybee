'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MakeAdminButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMakeAdmin = async () => {
    setLoading(true)
    await fetch('/api/dev/make-admin', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <button
      onClick={handleMakeAdmin}
      disabled={loading}
      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-colors mt-8"
    >
      {loading ? 'Processing...' : 'Dev: Enter Admin Dashboard ???'}
    </button>
  )
}
