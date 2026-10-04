import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, BookOpen, Brain, LineChart, Sparkles, ShieldCheck, Heart, UserPlus, CheckCircle2, Bot } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'HoneyBee Learning — Unlock Your Child\'s Potential',
  description: 'Understand, track, and support your child\'s learning journey with skill-focused resources designed for parents.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(3)

  return (
    <div className="bg-stone-50 min-h-screen">
      
      {/* 1. HERO SECTION: Parent -> Child -> Skills -> Learning -> Progress */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 pt-32 pb-24 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-800 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm animate-fade-in-up">
              <span className="text-lg">🐝</span> Empowering parents to guide early learning
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black text-stone-900 leading-[1.1] tracking-tight">
              Build the Skills That Matter, <span className="text-amber-500 block mt-2">From Early Years to Age 10.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-medium">
              Discover your child's strengths, identify areas for growth, and find age-appropriate learning resources expertly designed to support their development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/products"
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 group"
              >
                Explore Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="bg-white border-2 border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50 font-bold px-8 py-4 rounded-full text-lg transition-all inline-flex items-center justify-center gap-2"
              >
                See How It Works
              </a>
            </div>
            
            {/* The Parent Journey Mini-Nav */}
            <div className="pt-16 hidden md:flex items-center justify-center gap-4 text-sm font-bold text-stone-500">
              <span className="text-amber-600">Understand</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
              <span>Support</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
              <span>Learn</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
              <span>Track</span>
              <ArrowRight className="w-4 h-4 opacity-50" />
              <span>Improve</span>
            </div>
          </div>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-amber-600 tracking-wider uppercase mb-3">The Honeybee Journey</h2>
            <h3 className="text-3xl md:text-5xl font-display font-black text-stone-900">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-stone-100 z-0" />
            
            {[
              { title: 'Create Profile', desc: 'Tell us about your child\'s age and interests.', icon: UserPlus },
              { title: 'Understand', desc: 'Identify age-appropriate milestones and skills.', icon: Brain },
              { title: 'Discover', desc: 'Find targeted books and learning resources.', icon: Sparkles },
              { title: 'Learn & Play', desc: 'Bond and practice skills together at home.', icon: BookOpen },
              { title: 'Track Progress', desc: 'Watch them grow and get the next recommendations.', icon: LineChart },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white border-4 border-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <step.icon className="w-10 h-10 text-amber-500" />
                </div>
                <h4 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h4>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUCT <-> SKILL CONNECTION */}
      <section className="py-24 bg-stone-900 text-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-display font-black leading-tight">
                More than just books.<br/>
                <span className="text-amber-400">Targeted Skill Development.</span>
              </h2>
              <p className="text-lg text-stone-300 leading-relaxed">
                We don't just recommend books. Every resource in our library is carefully mapped to specific cognitive and developmental skills. We help you understand exactly <strong>what</strong> your child is learning and <strong>why</strong> it matters.
              </p>
              
              <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Example: Early Reading Book</h4>
                    <p className="text-sm text-stone-400">Recommended for Age 4-5</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-stone-400 mb-4 justify-center">
                  <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                  <span className="text-sm font-medium italic">develops</span>
                  <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-500/30">Vocabulary</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-500/30">Memory</span>
                  <span className="bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-sm font-semibold border border-rose-500/30">Social & Emotional</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Language & Communication', emoji: '🗣️' },
                { name: 'Cognitive Development', emoji: '🧠' },
                { name: 'Early Numeracy', emoji: '🔢' },
                { name: 'Problem Solving', emoji: '🧩' },
                { name: 'Social & Emotional', emoji: '🤝' },
                { name: 'Fine Motor Skills', emoji: '✍️' },
              ].map(skill => (
                <div key={skill.name} className="bg-stone-800 border border-stone-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-stone-700 transition-colors">
                  <span className="text-3xl">{skill.emoji}</span>
                  <span className="font-bold text-sm text-stone-200">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. AGE JOURNEY */}
      <section className="py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-amber-600 tracking-wider uppercase mb-3">Developmental Milestones</h2>
            <h3 className="text-3xl md:text-5xl font-display font-black text-stone-900">A Journey of Growth</h3>
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto">Every stage brings new cognitive and physical leaps. We provide the right resources at exactly the right time.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { age: '0–2 Years', title: 'Sensory & Discovery', desc: 'Foundations of language, motor control, and basic problem solving through exploration.' },
              { age: '3–5 Years', title: 'School Readiness', desc: 'Early literacy, numeracy, social independence, and creative expression.' },
              { age: '6–8 Years', title: 'Foundational Learning', desc: 'Reading fluency, mathematical concepts, and critical thinking.' },
              { age: '9–10 Years', title: 'Independent Reasoning', desc: 'Advanced problem solving, emotional regulation, and knowledge building.' },
            ].map((stage, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="bg-amber-100 text-amber-800 font-black text-xl px-4 py-1.5 rounded-full inline-block mb-4">
                  {stage.age}
                </div>
                <h4 className="font-display font-bold text-xl text-stone-900 mb-2">{stage.title}</h4>
                <p className="text-stone-500 text-sm leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPLORE PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-stone-900 mb-4">Explore Learning Resources</h2>
              <p className="text-stone-500 text-lg">Curated materials to accelerate development.</p>
            </div>
            <Link href="/products" className="text-amber-600 font-bold hover:text-amber-700 flex items-center gap-2">
              View All Resources <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts?.map((product) => (
              <div key={product.id} className="bg-stone-50 rounded-3xl overflow-hidden border border-stone-100 flex flex-col group hover:shadow-lg transition-all">
                <div className="h-48 bg-stone-200 relative overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <BookOpen className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-stone-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Age {product.age_range || 'All'}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-xl text-stone-900 mb-2">{product.name}</h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-1">
                    {product.description}
                  </p>
                  
                  {product.skills && product.skills.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Builds Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.skills.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Link href={`/products/${product.id}`} className="w-full bg-white border-2 border-amber-200 text-amber-700 font-bold py-3 text-center rounded-xl hover:bg-amber-50 transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AI COACH & PARENT SUPPORT */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-blue-50 border-y border-indigo-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-600/30">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-stone-900 mb-6 leading-tight">
                Meet the HoneyBee AI Coach
              </h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Parents shouldn't have to figure it all out alone. Our integrated AI Coach reviews your child's learning history, identifies their strengths, and proactively suggests areas for improvement.
              </p>
              <ul className="space-y-4">
                {[
                  'Personalized book & activity recommendations',
                  'Answers to developmental questions',
                  'Insights based on completed milestones',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium text-stone-700">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100 relative z-10">
                <div className="space-y-4">
                  <div className="bg-stone-50 rounded-2xl p-4 text-sm text-stone-700 rounded-tl-none inline-block max-w-[80%] border border-stone-100">
                    What should I focus on for my 4-year-old who loves drawing but struggles with numbers?
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-900 rounded-tr-none inline-block max-w-[85%] self-end float-right border border-indigo-100">
                    <p className="font-bold mb-2 flex items-center gap-2"><Bot className="w-4 h-4"/> HoneyBee Coach</p>
                    Since they love drawing, let's incorporate numbers into their art! I recommend the "Color By Numbers" activity book. It bridges their fine motor creativity with early numeral recognition.
                  </div>
                  <div className="clear-both"></div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 w-64 h-64 bg-indigo-300/30 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. RESEARCH & TRUST SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black text-stone-900 mb-12">Grounded in Early Childhood Research</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { title: 'Evidence-Informed', desc: 'Our skill frameworks align with established milestones recognized by major developmental organizations.', icon: ShieldCheck },
              { title: 'Parent-Led Connection', desc: 'Research consistently shows that active parent involvement is the strongest predictor of early learning success.', icon: Heart },
              { title: 'Safe & Private', desc: 'Your child\'s data is secure. We use it solely to personalize their learning journey and empower your guidance.', icon: ShieldCheck },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-stone-900 mb-2">{feature.title}</h4>
                <p className="text-stone-500 text-sm max-w-xs">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 text-left max-w-4xl mx-auto">
            <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-500"/> Why Early Skills Matter</h4>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              According to the <span className="font-semibold text-stone-800">National Institute of Child Health and Human Development (NICHD)</span>, early interactions and targeted learning experiences form the foundation for later academic and social success. 
            </p>
            <p className="text-stone-600 text-sm leading-relaxed">
              HoneyBee Learning does not guarantee specific academic outcomes. Instead, we provide evidence-informed tools that support you in creating rich, engaging learning opportunities tailored to your child's current developmental stage.
            </p>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[3rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">
                Start Their Journey Today
              </h2>
              <p className="text-amber-50 text-xl mb-10 max-w-2xl mx-auto">
                Join our community of parents dedicated to building the skills that matter. Create a free profile for your child and unlock personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="bg-white text-amber-600 font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:bg-stone-50 transition-all active:scale-95"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🐝</span>
            <span className="font-display font-bold text-white text-lg">
              HoneyBee Learning
            </span>
          </div>
          <p className="text-sm mb-6 max-w-sm mx-auto">
            Understanding, tracking, and supporting your child's early learning journey.
          </p>
          <div className="flex justify-center gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-amber-400 transition-colors">Products</Link>
            <Link href="/login" className="hover:text-amber-400 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-amber-400 transition-colors">Sign Up</Link>
          </div>
          <p className="mt-8 text-xs opacity-50">
            &copy; {new Date().getFullYear()} HoneyBee Learning. All rights reserved. Not intended as medical or developmental diagnostic tools.
          </p>
        </div>
      </footer>
    </div>
  )
}