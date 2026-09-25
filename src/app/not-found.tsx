import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">??</div>
        <h1 className="text-4xl font-display font-black text-stone-900 mb-3">
          Lost your way?
        </h1>
        <p className="text-stone-500 mb-8">
          This page doesn&apos;t exist. Let&apos;s get you back to the hive.
        </p>
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md hover:shadow-lg inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
