
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'

interface ActivityCompletionButtonProps {
  activityId: string
  durationMins: number | null
  childrenList: Array<{ id: string; name: string; avatar_url: string | null }>
  completedBy: string[] // Array of child IDs who have already completed this
}

export default function ActivityCompletionButton({ activityId, durationMins, childrenList, completedBy }: ActivityCompletionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>(
    childrenList.length === 1 ? childrenList[0].id : ''
  )
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()

  const isCompletedBySelected = selectedChild ? completedBy.includes(selectedChild) : false

  async function toggleCompletion() {
    if (!selectedChild) {
      error('Please select a child first.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/activities/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: activityId,
          child_id: selectedChild,
          completed: !isCompletedBySelected,
          duration_mins: durationMins
        })
      })
      if (!res.ok) throw new Error('Failed to update status')
      
      if (!isCompletedBySelected) {
        success('Activity marked as complete! ??')
      }
      router.refresh()
    } catch (e) {
      error('Failed to update completion status.')
    } finally {
      setLoading(false)
    }
  }

  if (childrenList.length === 0) {
    return (
      <p className="text-stone-500 text-sm">Assign kits to your children to track progress.</p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {childrenList.length > 1 && (
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none w-64 text-center font-medium"
        >
          <option value="" disabled>Select a child...</option>
          {childrenList.map(child => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      )}

      <button 
        onClick={toggleCompletion}
        disabled={loading || !selectedChild}
        className={`inline-flex items-center gap-2 font-bold px-8 py-4 rounded-full transition-all shadow-md text-lg ${
          isCompletedBySelected
            ? 'bg-stone-100 hover:bg-stone-200 text-stone-600 shadow-none'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
        {isCompletedBySelected ? 'Completed' : 'Mark as Complete'}
      </button>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
