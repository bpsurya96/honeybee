'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'

export default function DeleteChildButton({ childId, childName }: { childId: string, childName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDeleting(true)
    const { error } = await supabase.rpc('soft_delete_child', { p_child_id: childId })
    
    setIsDeleting(false)
    if (!error) {
      setIsOpen(false)
      router.refresh()
    } else {
      console.error(error)
      alert('Failed to delete child profile.')
    }
  }

  return (
    <>
      <button 
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
        className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
        title={`Delete ${childName}`}
      >
        <Trash2 size={18} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
          onClick={(e) => {
             e.preventDefault()
             e.stopPropagation()
          }}
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-display font-black text-center text-stone-900 mb-2">
              Remove {childName}?
            </h3>
            
            <p className="text-center text-stone-500 mb-8 leading-relaxed">
              Are you sure you want to delete this profile? This action will completely remove <strong>{childName}'s</strong> learning progress and AI Coach history.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
