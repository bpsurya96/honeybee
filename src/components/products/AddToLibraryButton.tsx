'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'

export default function AddToLibraryButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { success, error } = useToast()

  async function handleAdd() {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}/add-to-library`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to add product')
      
      success('Product added to your library!')
      router.push('/orders') // Redirect to orders/library to assign
    } catch (e: any) {
      error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleAdd}
      disabled={loading}
      className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-4 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-lg"
    >
      {loading ? 'Adding...' : 'Add to Library'}
    </button>
  )
}
