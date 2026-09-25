
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Play, Clock, CheckCircle2 } from 'lucide-react'
import SkillBadge from '@/components/products/SkillBadge'
import type { Skill } from '@/types'
import ActivityCompletionButton from './ActivityCompletionButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: activity } = await supabase.from('activities').select('name').eq('id', id).single()
  return { title: activity?.name ? `${activity.name} | HoneyBee` : 'Activity | HoneyBee' }
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: activityData } = await supabase
    .from('activities')
    .select(`
      *,
      activity_skills (
        skills (*)
      ),
      product:products(id, name)
    `)
    .eq('id', id)
    .single()

  if (!activityData) notFound()

  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: childrenData } = await supabase.from('children').select('id, name, avatar_url').eq('parent_id', user!.id)
  const { data: completions } = await supabase.from('child_activities').select('child_id').eq('activity_id', id).eq('completed', true)
  const completedBy = (completions || []).map((c: any) => c.child_id)
  
  const activity = {
    ...activityData,
    skills: activityData.activity_skills.map((as: any) => as.skills).filter(Boolean) as Skill[]
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link 
        href={`/products/${activity.product_id}`}
        className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Back to {activity.product.name}
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
        <div className="aspect-video bg-amber-100 relative">
          {false ? (
            <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
              {/* This would be an actual video player */}
              <div className="text-center">
                <Play size={48} className="mx-auto mb-2 text-amber-500" />
                <p>Play Video</p>
              </div>
            </div>
          ) : (
            <img 
              src={ 'https://placehold.co/1200x675/fef3c7/d97706?text=Activity'} 
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold border border-amber-200">
              <Clock size={16} />
              {activity.duration_mins} minutes
            </span>
            <span className="text-stone-400 text-sm font-semibold uppercase tracking-wider">
              {'Activity'}
            </span>
          </div>

          <h1 className="text-3xl font-display font-black text-stone-900 mb-4">
            {activity.name}
          </h1>

          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            {activity.description}
          </p>

          {activity.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wider">Skills Developed</h3>
              <div className="flex flex-wrap gap-2">
                {activity.skills.map((skill: Skill) => (
                  <SkillBadge key={skill.id} name={skill.name}  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-8 mt-4 text-center">
            <ActivityCompletionButton 
              activityId={activity.id}
              durationMins={activity.duration_mins}
              childrenList={childrenData || []}
              completedBy={completedBy}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
