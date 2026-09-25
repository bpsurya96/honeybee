/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateAgeMonths, formatAge } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Child } from '@/types'

interface AppHeaderProps {
  user: User
}

const navLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: '/children', label: 'Children' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/coach', label: 'Coach' },
  { href: '/profile', label: 'Profile' },
]

export default function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const [children, setChildren] = useState<Child[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('children')
      .select('id, name, date_of_birth, avatar_url, parent_id, gender, created_at, updated_at')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setChildren(data) })
   }, [user.id, pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🐝</span>
          <span className="font-display font-800 text-lg text-stone-900 hidden sm:block">
            HoneyBee<span className="text-amber-500"> Learning</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Child Selector (shows when children exist) */}
        {children.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-3 py-1.5 transition-colors text-sm"
            >
              <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {children[0].avatar_url ? (
                  <img src={children[0].avatar_url} alt={children[0].name} className="w-full h-full object-cover" />
                ) : (
                  children[0].name[0].toUpperCase()
                )}
              </div>
              <span className="font-semibold text-amber-800 max-w-20 truncate hidden sm:block">
                {children[0].name}
              </span>
              <ChevronDown size={14} className={`text-amber-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 min-w-48 z-50">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-2 py-1 mb-1">
                  Switch child
                </p>
                {children.map((child) => {
                  const age = formatAge(calculateAgeMonths(child.date_of_birth))
                  return (
                    <Link
                      key={child.id}
                      href={`/children/${child.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors w-full text-left"
                    >
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-sm font-bold text-amber-600 overflow-hidden shrink-0">
                        {child.avatar_url ? (
                          <img src={child.avatar_url} alt={child.name} className="w-full h-full object-cover" />
                        ) : (
                          child.name[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 text-sm truncate">{child.name}</p>
                        <p className="text-stone-400 text-xs">{age}</p>
                      </div>
                    </Link>
                  )
                })}
                <div className="border-t border-stone-100 mt-2 pt-2">
                  <Link
                    href="/children/new"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-50 transition-colors text-sm text-stone-500 hover:text-stone-700"
                  >
                    <span>+</span> Add child
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
