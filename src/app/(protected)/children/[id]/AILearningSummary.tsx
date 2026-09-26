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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-4">
        <h2 className="text-xl font-bold mb-4">{child.name}'s Learning Profile</h2>
        <div className="w-full bg-stone-100 rounded-full h-4 mb-2 overflow-hidden">
          <div className="bg-amber-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${finalProgress}%` }}></div>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-stone-500">Profile Progress: {finalProgress}%</span>
          {profile && profile.ai_credits > 0 && (
            <span className="text-amber-600">✨ AI Credits: ₹{profile.ai_credits.toFixed(2)}</span>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          *Progress based on completed profile info, child information, reading/activity data, and AI insights.
        </p>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-sm border border-amber-100 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-bold text-stone-900">AI Learning Summary</h2>
        </div>
        <p className="text-stone-600 mb-6 text-sm">
          Based on {child.name}'s age ({Math.floor(ageMonths/12)}y {ageMonths%12}m) and recent learning activity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 rounded-2xl p-4 border border-white">
            <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
              <span>🌟</span> Strengths
            </h3>
            <ul className="space-y-2">
              {aiSummary.strengths.map((strength, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/60 rounded-2xl p-4 border border-white">
            <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
              <span>🌱</span> Areas to Develop
            </h3>
            <ul className="space-y-2">
              {aiSummary.areasToDevelop.map((area, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>📚</span> Recommended for {child.name}
        </h3>
        
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm italic">We are curating the best books for {child.name}. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
