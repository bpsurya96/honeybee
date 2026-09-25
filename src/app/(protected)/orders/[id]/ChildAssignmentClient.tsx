
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { Loader2, Check } from 'lucide-react'

interface ChildAssignmentClientProps {
  item: any
  childrenList: Array<{ id: string; name: string; avatar_url: string | null }>
}

export default function ChildAssignmentClient({ item, childrenList }: ChildAssignmentClientProps) {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)

  // item.assignment might be an array or object depending on Supabase query structure, usually an array for 1:N but we enforced unique order_item_id in DB.
  const currentAssignedId = Array.isArray(item.assignment) && item.assignment.length > 0 
    ? item.assignment[0].child_id 
    : item.assignment?.child_id

  async function handleAssign(childId: string) {
    if (childId === currentAssignedId) return
    setLoading(true)
    try {
      const res = await fetch('/api/orders/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_item_id: item.id,
          child_id: childId
        })
      })
      if (!res.ok) throw new Error('Assignment failed')
      success('Kit assigned successfully!')
      router.refresh()
    } catch (e) {
      showError('Failed to assign kit.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
            <img 
              src={item.product.image_url || 'https://placehold.co/200x200'} 
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-display font-bold text-stone-900">{item.product.name}</h4>
            <p className="text-stone-500 text-sm">Qty: {item.quantity}</p>
          </div>
        </div>

        <div className="w-full md:w-64 relative">
          <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
            Assigned to
          </label>
          <select
            disabled={loading || childrenList.length === 0}
            value={currentAssignedId || ''}
            onChange={(e) => handleAssign(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none appearance-none font-medium disabled:opacity-50"
          >
            <option value="" disabled>Select a child...</option>
            {childrenList.map(child => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-[28px] pointer-events-none text-stone-400">
            {loading ? <Loader2 size={16} className="animate-spin" /> : '?'}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
