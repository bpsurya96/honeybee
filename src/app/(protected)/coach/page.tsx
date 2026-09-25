import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HoneyBee Coach',
}

export default function CoachPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-display font-black text-stone-900 mb-2">
        HoneyBee Coach
      </h1>
      <p className="text-stone-500 mb-8">
        Your personalised AI learning assistant.
      </p>
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-8 text-white text-center">
        <div className="text-6xl mb-4">??</div>
        <h2 className="font-display font-bold text-2xl mb-2">
          Coming in Phase 6
        </h2>
        <p className="text-amber-100">
          HoneyBee Coach will help you understand what your child should practise
          next, which activities are appropriate for their age, and how to make
          the most of every learning moment.
        </p>
      </div>
    </div>
  )
}
