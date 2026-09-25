
import Link from 'next/link'
import type { Activity, Skill } from '@/types'
import SkillBadge from '../products/SkillBadge'

interface ActivityCardProps {
  activity: Activity & {
    skills?: Skill[]
  }
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Link 
      href={`/activities/${activity.id}`}
      className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex gap-4 items-start hover:shadow-md hover:border-amber-200 transition-all group"
    >
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
        <span>?</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-display font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
            {activity.name}
          </h4>
          {activity.duration_mins && (
            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {activity.duration_mins} min
            </span>
          )}
        </div>
        <p className="text-stone-500 text-sm mb-3 line-clamp-2">{activity.description}</p>
        
        {activity.skills && activity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activity.skills.map((skill: Skill) => (
              <SkillBadge key={skill.id} name={skill.name} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
