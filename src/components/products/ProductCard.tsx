
import Link from 'next/link'
import AgeRangeBadge from './AgeRangeBadge'
import SkillBadge from './SkillBadge'
import type { Product, Skill } from '@/types'

interface ProductCardProps {
  product: Product & {
    skills?: Skill[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image_url || 'https://placehold.co/400x400/f8fafc/94a3b8?text=Product'
  
  return (
    <Link 
      href={`/products/${product.id}`}
      className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200 transition-all group flex flex-col h-full"
    >
      <div className="aspect-square bg-stone-50 rounded-2xl mb-4 overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <AgeRangeBadge minMonths={product.age_min_months} maxMonths={product.age_max_months} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-display font-bold text-lg text-stone-900 leading-tight">
            {product.name}
          </h3>
          <span className="font-bold text-amber-600">�{product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {product.skills && product.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {product.skills.slice(0, 2).map((skill: Skill) => (
              <SkillBadge key={skill.id} name={skill.name} />
            ))}
            {product.skills.length > 2 && (
              <div className="inline-flex items-center justify-center bg-stone-50 text-stone-500 px-2 py-1 rounded-full text-xs font-bold border border-stone-100">
                +{product.skills.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
