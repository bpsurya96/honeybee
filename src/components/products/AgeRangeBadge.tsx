
import { formatAgeRange } from '@/lib/utils'

interface AgeRangeBadgeProps {
  minMonths: number
  maxMonths: number
}

export default function AgeRangeBadge({ minMonths, maxMonths }: AgeRangeBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">
      <span>👶</span>
      <span>{formatAgeRange(minMonths, maxMonths)}</span>
    </div>
  )
}
