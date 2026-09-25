
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedOrderButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dev/seed-orders', { method: 'POST' })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleSeed}
      disabled={loading}
      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold px-8 py-3 rounded-full transition-all mt-4 ml-4"
    >
      {loading ? 'Generating...' : 'Seed Demo Order (Dev)'}
    </button>
  )
}
