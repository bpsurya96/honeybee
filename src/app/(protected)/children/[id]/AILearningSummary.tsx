import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/products/ProductCard';

// Dummy AI Assessment for demo purposes
function generateAiSummary(childName: string, ageMonths: number) {
  let strengths = [];
  let areasToDevelop = [];
  let recommendedSkills = [];

  if (ageMonths < 24) {
    strengths = ['Motor skills', 'Visual tracking'];
    areasToDevelop = ['Vocabulary', 'Early speech'];
    recommendedSkills = ['Vocabulary'];
  } else if (ageMonths < 48) {
    strengths = ['Curiosity', 'Basic vocabulary', 'Creativity'];
    areasToDevelop = ['Problem solving', 'Story comprehension'];
    recommendedSkills = ['Problem Solving'];
  } else {
    strengths = ['Story comprehension', 'Creativity', 'Social skills'];
    areasToDevelop = ['Reading practice', 'Complex problem solving'];
    recommendedSkills = ['Reading'];
  }

  return { strengths, areasToDevelop, recommendedSkills };
}

export default async function AILearningSummary({ childId }: { childId: string }) {
  const supabase = await createClient();

  const { data: child } = await supabase
    .from('children')
    .select('*, child_activities(*)')
    .eq('id', childId)
    .single();

  if (!child) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, ai_credits')
    .eq('id', child.parent_id)
    .single();

  const dob = new Date(child.date_of_birth);
  const now = new Date();
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();

  const aiSummary = generateAiSummary(child.name, ageMonths);

  // Profile Progress calculation
  let progress = 0;
  if (profile?.full_name) progress += 10;
  if (profile?.avatar_url) progress += 10;
  progress += 20; // for having the child profile
  
  const activitiesCount = child.child_activities?.length || 0;
  progress += Math.min(activitiesCount * 10, 40);
  
  if (profile && profile.ai_credits > 0) progress += 20;
  
  const finalProgress = Math.min(progress, 100);

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
    skills: p.product_skills?.map((ps: any) => ps.skills).filter(Boolean)
  }));

  return (
    <div className="space-y-6 mt-8">
      {/* Progress Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4 card-bouncy">
        <h2 className="text-xl font-display font-black text-stone-900 mb-4">{child.name}'s Learning Profile</h2>
        <div className="w-full bg-stone-100 rounded-full h-5 mb-3 overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-[var(--color-fun-yellow)] to-[var(--color-fun-red)] h-5 rounded-full transition-all duration-1000 flex items-center justify-end px-2" style={{ width: `${finalProgress}%` }}>
            <span className="text-[10px] font-black text-white">{finalProgress}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-stone-500">Profile Completeness</span>
          {profile && profile.ai_credits > 0 && (
            <span className="text-[var(--color-fun-purple)] font-black bg-purple-50 px-3 py-1 btn-pill border border-purple-100">
              ✨ AI Credits: ₹{profile.ai_credits.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-2 font-medium">
          *Progress based on completed profile info, child information, reading/activity data, and AI insights.
        </p>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-sm border border-indigo-100 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-pulse">🤖</span>
          <h2 className="text-2xl font-display font-black text-[var(--color-fun-purple)]">AI Learning Summary</h2>
        </div>
        <p className="text-stone-600 mb-8 font-medium">
          Based on {child.name}'s age ({Math.floor(ageMonths/12)}y {ageMonths%12}m) and recent learning activity.
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
