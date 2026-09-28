'use client';

import Link from 'next/link'
import type { Product, Skill } from '@/types'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product & {
    skills?: Skill[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.image_url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product'
  const { addToCart } = useCart();
  
  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-stone-100 transition-all duration-300 flex flex-col h-full group">
      <Link href={`/products/${product.id}`} className="block flex-1 flex flex-col relative">
        {/* Image Container */}
        <div className="aspect-[4/3] bg-stone-50 rounded-2xl mb-5 overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Top Badges */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-stone-700 border border-white/20">
              {product.min_age_months}-{product.max_age_months}m
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col px-1">
          <div className="mb-2">
            <h3 className="font-display font-black text-xl text-stone-900 leading-tight line-clamp-2 group-hover:text-[var(--color-fun-purple)] transition-colors">
              {product.name}
            </h3>
          </div>
          
          <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1 font-medium leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-2xl text-stone-900">?{product.price.toFixed(2)}</span>
            {product.skills && product.skills.length > 0 && (
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {product.skills.length} Skills
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Actions */}
      <button
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
        className="w-full py-3.5 bg-stone-900 hover:bg-[var(--color-fun-red)] text-white font-bold rounded-2xl transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <span>Add to Cart</span>
        <span className="text-lg">??</span>
      </button>
    </div>
  )
}
