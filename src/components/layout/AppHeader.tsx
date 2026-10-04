'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useCart } from '@/context/CartContext'

interface AppHeaderProps {
  user: User | null
}

const navLinks = [
  { href: '/dashboard', label: 'Home 🏠' },
  { href: '/products', label: 'Products 📚' },
  { href: '/orders', label: 'Orders 📦' },
  { href: '/coach', label: 'Coach 🧠' },
  { href: '/profile', label: 'Profile 👤' },
]

export default function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [parentName, setParentName] = useState<string>('Parent')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { totalItems } = useCart();

  useEffect(() => {
    if (!user) return;
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
  }, [user?.id])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 shrink-0 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🐝</span>
          <span className="font-display font-800 text-lg text-stone-900 hidden sm:block">
            HoneyBee<span className="text-amber-500"> Learning</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.filter(l => user || l.href === "/products" || l.href === "/cart").map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold transition-colors hover:text-amber-600 ${pathname === link.href ? "text-amber-600 border-b-2 border-amber-600 pb-1" : "text-stone-600"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-stone-600 hover:text-amber-600 transition-colors hover:scale-110 duration-200">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-stone-200 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.id}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-display font-bold text-stone-700 hidden sm:block">
                  {parentName}
                </span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-stone-50 bg-stone-50/50">
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-stone-800 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-stone-700 font-medium hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-stone-700 hover:text-amber-600 transition-colors hidden sm:block">Log In</Link>
              <Link href="/signup" className="text-sm font-bold bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 shadow-md transition-all active:scale-95">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}