/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useCart } from '@/context/CartContext'

interface AppHeaderProps {
  user: User
}

const navLinks = [
  { href: '/dashboard', label: 'Home 🏠' },
  { href: '/children', label: 'Children 👦' },
  { href: '/products', label: 'Products 📚' },
  { href: '/orders', label: 'Orders 📦' },
  { href: '/coach', label: 'Coach 🧠' },
  { href: '/profile', label: 'Profile 👤' },
]

export default function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const [parentName, setParentName] = useState<string>('Parent')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { totalItems } = useCart();

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data && data.full_name) {
          setParentName(data.full_name)
        }
      })
  }, [user.id])

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
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🐝</span>
          <span className="font-display font-800 text-lg text-stone-900 hidden sm:block">
            HoneyBee<span className="text-[var(--color-fun-red)]"> Learning</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 btn-pill text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'bg-[var(--color-fun-yellow)] text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-stone-600 hover:text-[var(--color-fun-red)] transition-colors hover:scale-110 duration-200">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-[var(--color-fun-red)] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Parent Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-[var(--color-fun-purple)] hover:bg-[#3b085e] border border-transparent btn-pill px-3 py-1.5 transition-colors text-sm"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-fun-purple)] overflow-hidden">
                {parentName[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left hidden sm:block text-white">
                <span className="font-semibold max-w-28 truncate leading-tight">
                  {parentName}
                </span>
              </div>
              <ChevronDown size={14} className={`text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 min-w-48 z-50">
                <div className="px-3 py-2 border-b border-stone-100 mb-2">
                  <p className="font-semibold text-stone-900 text-sm truncate">{parentName}</p>
                  <p className="text-stone-400 text-xs">Parent Account</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 btn-pill hover:bg-[var(--color-fun-yellow)] transition-colors w-full text-left"
                >
                  <span className="text-sm font-medium text-stone-700">My Profile</span>
                </Link>
                <div className="border-t border-stone-100 mt-2 pt-2">
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-3 py-2 btn-pill hover:bg-red-50 transition-colors text-sm text-red-500 font-medium"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
