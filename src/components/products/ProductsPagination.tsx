
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductsPaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
}

export default function ProductsPagination({ totalItems, pageSize, currentPage }: ProductsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <div className="p-2 rounded-xl border border-stone-100 text-stone-300 cursor-not-allowed">
          <ChevronLeft size={20} />
        </div>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={createPageURL(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
            currentPage === page
              ? 'bg-amber-500 text-white shadow-md'
              : 'border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
          <ChevronRight size={20} />
        </Link>
      ) : (
        <div className="p-2 rounded-xl border border-stone-100 text-stone-300 cursor-not-allowed">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  )
}
