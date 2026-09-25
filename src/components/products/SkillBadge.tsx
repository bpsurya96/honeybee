
interface SkillBadgeProps {
  name: string
}

export default function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-stone-200 hover:bg-stone-200 transition-colors">
      <span>{name}</span>
    </div>
  )
}
