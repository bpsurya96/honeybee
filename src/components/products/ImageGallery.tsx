'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0] || 'https://placehold.co/800x800/fef3c7/d97706?text=Product')
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Container — warm amber backdrop, object-fit contain to show full product */}
      <div
        className="relative w-full rounded-3xl overflow-hidden cursor-zoom-in group"
        style={{
          background: 'linear-gradient(135deg, #fef9ec 0%, #fde68a 60%, #fbbf24 100%)',
          aspectRatio: '4/3',
          boxShadow: '0 20px 60px -12px rgba(217, 119, 6, 0.25), 0 8px 24px -8px rgba(0,0,0,0.12)',
        }}
        onClick={() => setIsZoomed(!isZoomed)}
        role="button"
        aria-label="Product image"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') setIsZoomed(!isZoomed) }}
      >
        {/* Decorative soft blobs */}
        <div className="absolute top-4 left-4 w-20 h-20 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fcd34d, transparent)' }} aria-hidden="true" />
        <div className="absolute bottom-4 right-4 w-28 h-28 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} aria-hidden="true" />

        <img
          key={mainImage}
          src={mainImage}
          alt={alt}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.18))' }}
        />

        {/* Hover badge */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm text-stone-600 text-xs font-semibold px-3 py-1 rounded-full border border-white/60">
          Click to zoom
        </div>
      </div>

      {/* Thumbnails — only shown when multiple images exist */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImage(img)}
              aria-label={`View image ${i + 1}`}
              className={[
                'flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200',
                mainImage === img
                  ? 'border-amber-500 shadow-md scale-105'
                  : 'border-stone-200 opacity-60 hover:opacity-100 hover:border-amber-300',
              ].join(' ')}
              style={{ background: 'linear-gradient(135deg, #fef9ec, #fde68a)' }}
            >
              <img
                src={img}
                alt={`${alt} view ${i + 1}`}
                className="w-full h-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox overlay */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
        >
          <div className="relative max-w-2xl w-full rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fef9ec, #fde68a)' }}>
            <img
              src={mainImage}
              alt={alt}
              className="w-full h-auto object-contain p-8"
              style={{ maxHeight: '80vh', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}
            />
            <button
              onClick={e => { e.stopPropagation(); setIsZoomed(false) }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-stone-700 flex items-center justify-center font-bold text-lg shadow-md hover:bg-white transition-colors"
              aria-label="Close zoom view"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
