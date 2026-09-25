import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders',
}

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
        My Orders
      </h1>
      <p className="text-stone-500 mb-8">Your order history.</p>
      <div className="text-center py-16">
        <div className="text-6xl mb-4">???</div>
        <h2 className="text-xl font-display font-bold text-stone-900 mb-2">
          No orders yet
        </h2>
        <p className="text-stone-500">
          Browse our products and make your first purchase.
        </p>
      </div>
    </div>
  )
}
