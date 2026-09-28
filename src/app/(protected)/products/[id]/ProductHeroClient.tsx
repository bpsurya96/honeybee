/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, BookOpen } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import type { Product, Skill } from '@/types'

interface ProductHeroClientProps {
  product: Product & { skills: Skill[] }
  ageDisplay: string
  activityCount: number
}

const SKILL_COLOURS: Record<string, { bg: string; text: string }> = {
  'Language & Literacy': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Cognitive': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Motor Skills': { bg: 'bg-red-50', text: 'text-red-700' },
  'Social & Emotional': { bg: 'bg-pink-50', text: 'text-pink-700' },
  'Sensory': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  'Creativity': { bg: 'bg-green-50', text: 'text-green-700' },
  'Vocabulary': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Reading': { bg: 'bg-blue-50', text: 'text-blue-700' },
}
const DEFAULT_SKILL_COL = { bg: 'bg-stone-100', text: 'text-stone-700' }

export default function ProductHeroClient({ product, ageDisplay, activityCount }: ProductHeroClientProps) {
  const { addToCart } = useCart()
  const { toasts, removeToast, success } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  function handleAddToCart() {
    setAdding(true)
    addToCart(product, quantity)
    success(`${product.name} added to cart! 🛒`)
    setTimeout(() => setAdding(false), 700)
  }

  return (
    <div className="flex flex-col">

      {/* Age badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-bold border border-indigo-100">
          <span aria-hidden="true">👶</span>
          {ageDisplay}
        </span>
      </div>

      {/* Product name */}
      <h1 className="text-3xl md:text-4xl font-display font-black text-stone-900 leading-tight mb-3">
        {product.name}
      </h1>

      {/* Description */}
      {product.description && (
        <p className="text-stone-500 text-base leading-relaxed mb-6">
          {product.description}
        </p>
      )}

      {/* Skill chips */}
      {product.skills.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2.5">Skill Focus</p>
          <div className="flex flex-wrap gap-2">
            {product.skills.map((skill: any) => {
              const col = SKILL_COLOURS[skill.name] || DEFAULT_SKILL_COL
              return (
                <span
                  key={skill.id}
                  className={`inline-flex items-center gap-1.5 ${col.bg} ${col.text} px-3 py-1.5 rounded-full text-xs font-bold`}
                >
                  {skill.name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-7">
        <span
          className="text-[var(--color-fun-red)] font-display font-black"
          style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)' }}
        >
          &#8377;{product.price.toFixed(0)}
        </span>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4 mb-6">
        {/* Quantity control */}
        <div
          className="flex items-center bg-white border-2 border-stone-200 rounded-2xl overflow-hidden shadow-sm"
          role="group"
          aria-label="Quantity selector"
        >
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-11 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>
          <span
            className="w-10 text-center font-display font-black text-stone-900 text-lg select-none"
            aria-live="polite"
            aria-label={`Quantity: ${quantity}`}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            aria-label="Increase quantity"
            className="w-11 h-12 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          aria-label={adding ? 'Added to cart' : `Add ${product.name} to cart`}
          className="flex-1 flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-display font-black text-lg py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
        >
          <ShoppingCart size={20} aria-hidden="true" />
          {adding ? 'Added! ✓' : 'Add to Cart'}
        </button>
      </div>

      {/* Trust pills */}
      <div className="flex flex-wrap gap-2 pb-6 border-b border-stone-100">
        {[
          { icon: '📚', text: 'Educational kit' },
          { icon: '✅', text: 'Activity-based' },
          { icon: '🔒', text: 'Secure checkout' },
        ].map(({ icon, text }) => (
          <span key={text} className="inline-flex items-center gap-1.5 bg-stone-50 text-stone-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-stone-100">
            <span aria-hidden="true">{icon}</span>
            {text}
          </span>
        ))}
      </div>

      {/* Activity count */}
      {activityCount > 0 && (
        <div className="flex items-center gap-2.5 pt-5">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
            <BookOpen size={16} className="text-amber-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Includes</p>
            <p className="font-display font-bold text-stone-800 text-sm">
              {activityCount} interactive {activityCount === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      <div
        className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]"
        role="complementary"
        aria-label="Quick add to cart"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display font-black text-stone-900 text-sm leading-tight line-clamp-1">{product.name}</p>
          <p className="text-[var(--color-fun-red)] font-black text-base">&#8377;{product.price.toFixed(0)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding}
          aria-label="Add to cart"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-md active:scale-95 whitespace-nowrap text-sm"
        >
          <ShoppingCart size={16} aria-hidden="true" />
          {adding ? 'Added ✓' : 'Add to Cart'}
        </button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
