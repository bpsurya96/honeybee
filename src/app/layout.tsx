import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | HoneyBee Learning',
    default: 'HoneyBee Learning Â— Early Learning for Little Minds',
  },
  description:
    'A parent-focused personalised learning journey platform for young children aged newborn to 5 years.',
  keywords: [
    'early learning',
    'children',
    'toddler',
    'activities',
    'learning journey',
    'parent',
  ],
  authors: [{ name: 'HoneyBee Learning' }],
  creator: 'HoneyBee Learning',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f59e0b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
