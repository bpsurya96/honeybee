'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageGallery({ images, alt }: { images: string[], alt: string }) {
  const [mainImage, setMainImage] = useState(images[0] || 'https://placehold.co/800x800/f8fafc/94a3b8?text=Product')

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="aspect-square bg-stone-50 rounded-3xl overflow-hidden border border-stone-100 relative w-full">
        <img 
          src={mainImage} 
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setMainImage(img)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-amber-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={img} alt={`${alt} thumbnail ${i+1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
