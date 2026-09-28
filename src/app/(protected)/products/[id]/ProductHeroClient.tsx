'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import type { Product } from '@/types'

interface ProductHeroClientProps {
  product: Product
}

export default function ProductHeroClient({ product }: ProductHeroClientProps) {
  const { addToCart } = useCart()
  const { toasts, removeToast, success } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  function handleAddToCart() {
    setAdding(true)
    addToCart(product, quantity)
    success(`${product.name} added to cart! ??`)
    setTimeout(() => setAdding(false), 700)
  }

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      <div className="flex items-center gap-6 mb-4">
        <span className="font-semibold text-stone-500">Quantity</span>
        <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-2 border border-stone-200">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            <Minus size={20} />
          </button>
          <span className="font-bold text-xl text-stone-900 w-8 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-stone-50 transition-colors text-stone-600"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding}
        className="w-full py-5 bg-stone-900 hover:bg-[var(--color-fun-red)] text-white text-xl font-bold rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-70 disabled:hover:bg-stone-900"
      >
        <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
        {!adding && <ShoppingCart size={24} />}
      </button>
    </div>
  )
}


