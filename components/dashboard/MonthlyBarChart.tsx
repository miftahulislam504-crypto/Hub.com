// components/dashboard/MonthlyBarChart.tsx
'use client'
import { Project } from '@/lib/types'

interface Props {
  projects: Project[]
}

export default function MonthlyBarChart({ projects }: Props) {
  // Last 6 months
  const months: { label: string; count: number }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-BD', { month: 'short' })
    const count = projects.filter(p => {
      const pd = new Date(p.createdAt)
      return pd.getFullYear() === d.getFullYear() &&
             pd.getMonth()    === d.getMonth()
    }).length
    months.push({ label, count })
  }

  const maxCount = Math.max(...months.map(m => m.count), 1)
  const chartH   = 80
  const barW     = 28
  const gap      = 12
  const totalW   = (barW + gap) * months.length - gap

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3 text-right">শেষ ৬ মাস</p>
      <div className="flex items-end justify-between gap-2">
        {months.map((m, i) => {
          const h = Math.max((m.count / maxCount) * chartH, m.count > 0 ? 8 : 3)
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              {m.count > 0 && (
                <span className="text-xs font-bold text-primary-900">{m.count}</span>
              )}
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: h,
                  backgroundColor: m.count > 0 ? '#0D47A1' : '#E5E7EB',
                  minHeight: 3,
                }}
              />
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
