import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🐝</span>
            <span className="font-display font-800 text-xl text-stone-900">
              HoneyBee<span className="text-amber-500"> Learning</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-stone-600 hover:text-amber-600 transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/login"
              className="text-stone-600 hover:text-amber-600 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </nav>
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/login"
              className="text-stone-600 font-medium text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-full text-sm"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🐝</span>
              <span>Supporting little learners, one activity at a time</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-stone-900 mb-6 leading-tight">
              Learning that grows
              <span className="block text-amber-500">with your child</span>
            </h1>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              HoneyBee Learning is a personalised learning journey platform for
              children aged newborn to 5 years. Track progress, discover
              activities, and get expert guidance Ã‚â€” all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2 justify-center"
              >
                <span>Start Your Journey</span>
                <span>🐝</span>
              </Link>
              <Link
                href="/products"
                className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold px-8 py-4 rounded-full text-lg transition-all inline-flex items-center gap-2 justify-center"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: '📦',
                title: 'Curated Activities',
                description:
                  'Expertly designed activities for every age and stage, from newborn to 5 years.',
              },
              {
                icon: '🔥',
                title: 'Track Progress',
                description:
                  'See exactly which skills your child is developing across 9 learning areas.',
              },
              {
                icon: '📈',
                title: 'HoneyBee Coach',
                description:
                  'Your AI learning assistant that guides you with personalised, age-appropriate advice.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-display font-bold text-stone-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Age Stages */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-4">
              Every stage. Every child.
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto mb-10">
              Age-appropriate activities and learning journeys designed for each
              developmental stage.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                '0Ã‚â€“6 months',
                '6Ã‚â€“12 months',
                '1Ã‚â€“2 years',
                '2Ã‚â€“3 years',
                '3Ã‚â€“4 years',
                '4Ã‚â€“5 years',
              ].map((stage) => (
                <span
                  key={stage}
                  className="bg-amber-100 text-amber-800 px-5 py-2 rounded-full font-semibold text-sm"
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          {/* Learning Areas */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/80 shadow-sm mb-16">
            <h2 className="text-2xl font-display font-black text-stone-900 mb-2 text-center">
              9 Learning Areas
            </h2>
            <p className="text-stone-500 text-center mb-8">
              A comprehensive framework covering all aspects of early childhood development
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: '🎨', name: 'Fine Motor Skills' },
                { icon: '🗣️', name: 'Language & Communication' },
                { icon: '🔢', name: 'Early Numeracy' },
                { icon: '🧠', name: 'Cognitive Skills' },
                { icon: '🧩', name: 'Problem Solving' },
                { icon: '🎭', name: 'Creativity' },
                { icon: '✍️', name: 'Pre-writing' },
                { icon: '🖐️', name: 'Sensory Exploration' },
                { icon: '🤝', name: 'Social & Emotional' },
              ].map((area) => (
                <div
                  key={area.name}
                  className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl"
                >
                  <span className="text-2xl">{area.icon}</span>
                  <span className="font-semibold text-stone-700 text-sm">
                    {area.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-12 shadow-xl">
            <div className="text-5xl mb-4">🐝</div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
              Ready to start your child&apos;s learning journey?
            </h2>
            <p className="text-amber-100 text-lg mb-8 max-w-md mx-auto">
              Join thousands of parents using HoneyBee Learning to support their
              child&apos;s development.
            </p>
            <Link
              href="/signup"
              className="bg-white text-amber-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-amber-50 transition-colors shadow-lg inline-flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <span>🐝</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🐝</span>
            <span className="font-display font-bold text-white text-lg">
              HoneyBee Learning
            </span>
          </div>
          <p className="text-sm mb-4">
            Supporting young learners, empowering parents.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/products"
              className="hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-xs">
            &copy; {new Date().getFullYear()} HoneyBee Learning. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
