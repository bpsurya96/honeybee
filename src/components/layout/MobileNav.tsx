'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BookOpen, ShoppingBag, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/coach', label: 'Coach', icon: BookOpen },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
          >
            <Icon
              size={22}
              className={isActive ? 'text-amber-500' : 'text-stone-400'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={`text-xs font-medium ${
                isActive ? 'text-amber-500' : 'text-stone-400'
              }`}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
