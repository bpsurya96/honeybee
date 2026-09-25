
'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import type { SkillProgress } from '@/types'

interface SkillRadarChartProps {
  data: SkillProgress[]
}

export default function SkillRadarChart({ data }: SkillRadarChartProps) {
  // Format data for Recharts
  const chartData = data.map(item => ({
    subject: item.category.name,
    score: Math.round(item.percentage) || 0,
    fullMark: 100,
  }))

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-2xl border border-stone-100">
        <span className="text-4xl mb-2">??</span>
        <p className="text-sm font-medium">No skill data available yet.</p>
        <p className="text-xs text-stone-400 mt-1">Complete activities to see progress here.</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e7e5e4" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#57534e', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip 
            formatter={(value: any) => [`${value}%`, 'Mastery']}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#f59e0b" // amber-500
            fill="#fbbf24"   // amber-400
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
