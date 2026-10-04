
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import type { AgeStage, Skill, SkillCategory } from '@/types'

interface ProductsFilterProps {
  ageStages: AgeStage[]
  categories: SkillCategory[]
  skills: Skill[]
}

export default function ProductsFilter({ ageStages, categories, skills }: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentAge = searchParams.get('age') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentSkill = searchParams.get('skill') || ''
  const currentSearch = searchParams.get('q') || ''

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset page to 1 on filter change
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => {
    router.push('/products')
    setIsOpen(false)
  }

  const activeCount = [currentAge, currentCategory, currentSkill, currentSearch].filter(Boolean).length

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Search</h3>
        <input
          type="text"
          placeholder="Search products..."
          defaultValue={currentSearch}
          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFilter('q', e.currentTarget.value)
          }}
        />
      </div>

      {/* Age Stage */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Age Group</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="age"
              checked={!currentAge}
              onChange={() => handleFilter('age', '')}
              className="text-amber-500 focus:ring-amber-500"
            />
            <span className={`text-sm ${!currentAge ? 'font-bold text-stone-900' : 'text-stone-600'}`}>All Ages</span>
          </label>
          {ageStages.map(age => (
            <label key={age.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="age"
                checked={currentAge === age.id}
                onChange={() => handleFilter('age', age.id)}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className={`text-sm ${currentAge === age.id ? 'font-bold text-stone-900' : 'text-stone-600'}`}>
                {age.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Learning Area (Category) */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Learning Area</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!currentCategory}
              onChange={() => handleFilter('category', '')}
              className="text-amber-500 focus:ring-amber-500"
            />
            <span className={`text-sm ${!currentCategory ? 'font-bold text-stone-900' : 'text-stone-600'}`}>All Areas</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={currentCategory === cat.id}
                onChange={() => handleFilter('category', cat.id)}
                className="text-amber-500 focus:ring-amber-500"
              />
              <span className={`text-sm ${currentCategory === cat.id ? 'font-bold text-stone-900' : 'text-stone-600'}`}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">Specific Skill</h3>
        <select
          value={currentSkill}
          onChange={(e) => handleFilter('skill', e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        >
          <option value="">All Skills</option>
          {skills
            .filter(s => !currentCategory || s.category_id === currentCategory)
            .map(skill => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 font-bold text-stone-700 hover:text-amber-600 transition-colors"
        >
          <Filter size={20} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-sm text-stone-500 hover:text-stone-900">
            Clear all
          </button>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-stone-900">Filters</h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-sm text-stone-500 hover:text-stone-900">
                Clear
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-stone-900">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <FilterContent />
            
            <div className="mt-8">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
