import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">🐝</span>
          <span className="font-display font-800 text-lg text-stone-900">
            HoneyBee<span className="text-amber-500"> Learning</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-stone-400">
        &copy; {new Date().getFullYear()} HoneyBee Learning
      </footer>
    </div>
  )
}
