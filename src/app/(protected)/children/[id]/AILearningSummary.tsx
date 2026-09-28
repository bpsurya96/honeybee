/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';

// Rule-based AI assessment based on child age.
// Note: this is a developmental guidance heuristic, not an ML assessment.
// It is intentionally labelled as such in the UI.
function generateAiSummary(childName: string, ageMonths: number) {
  let strengths: string[] = [];
  let areasToDevelop: string[] = [];

  if (ageMonths < 24) {
    strengths = ['Motor skills', 'Visual tracking'];
    areasToDevelop = ['Vocabulary', 'Early speech'];
  } else if (ageMonths < 48) {
    strengths = ['Curiosity', 'Basic vocabulary', 'Creativity'];
    areasToDevelop = ['Problem solving', 'Story comprehension'];
  } else {
    strengths = ['Story comprehension', 'Creativity', 'Social skills'];
    areasToDevelop = ['Reading practice', 'Complex problem solving'];
  }

  return { strengths, areasToDevelop };
}

export default async function AILearningSummary({ childId }: { childId: string }) {
  const supabase = await createClient();

  const { data: child } = await supabase
    .from('children')
    .select('name, date_of_birth, parent_id')
    .eq('id', childId)
    .single();

  if (!child) return null;

  const dob = new Date(child.date_of_birth);
  const now = new Date();
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();

  const aiSummary = generateAiSummary(child.name, ageMonths);

  // Fetch recommended books
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_skills (
        skills (*)
      )
    `)
    .eq('active', true)
    .limit(2);

  const recommendedProducts = (products || []).map(p => ({
    ...p,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skills: p.product_skills?.map((ps: any) => ps.skills).filter(Boolean)
  }));

  return (
    <div className="space-y-6 mt-8">
      {/* AI Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-sm border border-indigo-100 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-pulse">🤖</span>
          <h2 className="text-2xl font-display font-black text-[var(--color-fun-purple)]">AI Learning Summary</h2>
        </div>
        <p className="text-stone-600 mb-2 font-medium text-sm">
          Developmental guidance for {child.name} aged {Math.floor(ageMonths / 12)}y {ageMonths % 12}m.
        </p>
        <p className="text-stone-400 font-medium text-xs mb-8">
          *This is age-based guidance, not a personalised ML assessment. Complete activities for tracked progress.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-white shadow-sm card-bouncy">
            <h3 className="font-display font-black text-xl text-emerald-600 mb-4 flex items-center gap-2">
              <span>🌟</span> Strengths
            </h3>
            <ul className="space-y-3">
              {aiSummary.strengths.map((strength, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-white shadow-sm card-bouncy">
            <h3 className="font-display font-black text-xl text-[var(--color-fun-red)] mb-4 flex items-center gap-2">
              <span>🌱</span> Areas to Develop
            </h3>
            <ul className="space-y-3">
              {aiSummary.areasToDevelop.map((area, i) => (
                <li key={i} className="flex items-center gap-3 text-stone-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-fun-red)]"></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="font-display font-black text-2xl text-stone-900 mb-6 flex items-center gap-2">
          <span>📚</span> Recommended for {child.name}
        </h3>
        
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 font-medium italic bg-white p-4 rounded-2xl border border-stone-100">
            We are curating the best books for {child.name}. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
