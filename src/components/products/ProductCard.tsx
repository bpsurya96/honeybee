
'use client';

import Link from 'next/link'
import { useState } from 'react'
import type { Product, Skill } from '@/types'
import { useCart } from '@/context/CartContext'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Product & {
    skills?: Skill[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const fallback = 'https://placehold.co/400x400/ffffff/94a3b8?text=Image';
  const imageUrl = (product as any).thumbnail_url || (product.image_url ? product.image_url.split(',')[0] : fallback);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  
  const minYears = Math.floor(product.age_min_months / 12);
  const maxYears = Math.floor(product.age_max_months / 12);
  const ageLabel = maxYears > minYears ? `${minYears}-${maxYears} Yrs` : `${minYears}+ Yrs`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (adding) return;
    setAdding(true);
    addToCart(product);
    setTimeout(() => {
      setAdding(false);
    }, 1500);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-stone-200 overflow-hidden flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="block flex-1 flex flex-col relative">
        {/* Image Container */}
        <div className="w-full aspect-square bg-white border-b border-stone-100 overflow-hidden relative flex items-center justify-center p-4">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          />
          {/* Age Badge Floating */}
          <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm border border-stone-200 text-stone-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {ageLabel}
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-medium text-stone-800 text-xs sm:text-sm line-clamp-2 leading-snug mb-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="mt-1 mb-2 sm:mb-3 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-stone-900">
              &#8377;{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Skills tags */}
          {product.skills && product.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto mb-2">
              {product.skills.slice(0, 2).map((skill: Skill) => (
                <span key={skill.id} className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded">
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      
      {/* Add to Cart Footer */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full py-2 font-bold text-xs sm:text-sm rounded-full transition-all shadow-sm flex items-center justify-center gap-2 ${
            adding 
              ? 'bg-green-500 text-white border-green-600' 
              : 'bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2C200] border border-[#FCD200] text-stone-900'
          }`}
        >
          {adding ? (
            <>
              <span className="animate-in zoom-in duration-300">?</span> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={14} className="sm:w-4 sm:h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
