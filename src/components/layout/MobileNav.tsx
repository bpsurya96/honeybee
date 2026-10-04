
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BookOpen, ShoppingBag, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', guestHref: '/', label: 'Home', icon: Home },
  { href: '/children', label: 'Children', icon: Users },
  { href: '/coach', label: 'Coach', icon: BookOpen },
  { href: '/products', guestHref: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function MobileNav({ user }: { user?: any }) {
  const pathname = usePathname()

  return (
    <nav className="mobile-nav">
      {(user ? navItems : navItems.filter(l => l.guestHref)).map(({ href, guestHref, label, icon: Icon }) => {
        const finalHref = (!user && guestHref) ? guestHref : href;
        const isActive = pathname === finalHref || (finalHref !== '/' && pathname.startsWith(finalHref));
        return (
          <Link
            key={finalHref}
            href={finalHref}
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
