'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentUrl?: string | null
  name: string
  onUpload: (file: File) => Promise<void>
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-3xl',
}

export default function AvatarUpload({ currentUrl, name, onUpload, size = 'md' }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initial = name?.[0]?.toUpperCase() || '?'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setUploading(true)
    try {
      await onUpload(file)
    } catch {
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'rounded-2xl bg-amber-100 flex items-center justify-center font-display font-black text-amber-600 overflow-hidden relative group',
          sizes[size],
          'hover:ring-2 hover:ring-amber-400 hover:ring-offset-2 transition-all'
        )}
        disabled={uploading}
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 size={16} className="text-white animate-spin" />
          ) : (
            <Camera size={16} className="text-white" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
