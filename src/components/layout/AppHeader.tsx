'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface AppHeaderProps {
  user: User
}

export default function AppHeader({ user: _user }: AppHeaderProps) {
  const pathname = usePathname()

  const navLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/children', label: 'Children' },
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Orders' },
    { href: '/coach', label: 'Coach' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 h-16">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">??</span>
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
      </div>
    </header>
  )
}
