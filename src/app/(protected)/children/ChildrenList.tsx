'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { calculateAgeMonths, formatAge } from '@/lib/utils'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { Trash2, Pencil, ChevronRight } from 'lucide-react'
import type { Child } from '@/types'

interface ChildrenListProps {
  children: Child[]
}

export default function ChildrenList({ children }: ChildrenListProps) {
  const router = useRouter()
  const { toasts, removeToast, success, error: showError } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/children/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        success(`${deleteTarget.name} has been removed.`)
        router.refresh()
      } else {
        showError('Could not delete child. Please try again.')
      }
    } catch {
      showError('Something went wrong.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {children.map((child) => {
          const ageMonths = calculateAgeMonths(child.date_of_birth)
          const ageDisplay = formatAge(ageMonths)
          return (
            <div
              key={child.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-center justify-between group"
            >
              <Link href={`/children/${child.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center font-display font-black text-amber-600 shrink-0 overflow-hidden">
                  {child.avatar_url ? (
                    <img src={child.avatar_url} alt={child.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{child.name[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-stone-900 truncate">{child.name}</p>
                  <p className="text-stone-500 text-sm">{ageDisplay}</p>
                </div>
              </Link>
              <div className="flex items-center gap-1 ml-2">
                <Link
                  href={`/children/${child.id}/edit`}
                  className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => setDeleteTarget(child)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
                <Link href={`/children/${child.id}`} className="p-2 text-stone-400 hover:text-stone-700">
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Remove ${deleteTarget?.name}?`}
        message={`This will permanently delete ${deleteTarget?.name}'s profile, learning history, and progress. This cannot be undone.`}
        confirmLabel={deleting ? 'Removing...' : 'Yes, Remove'}
        cancelLabel="Cancel"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}
