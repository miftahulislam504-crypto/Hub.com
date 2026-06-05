// components/dashboard/StatCard.tsx
'use client'
import { LucideIcon } from 'lucide-react'

interface Props {
  label:    string
  value:    number | string
  icon:     LucideIcon
  color:    string
  bg:       string
  sub?:     string
  trend?:   number   // positive = up, negative = down
}

export default function StatCard({ label, value, icon: Icon, color, bg, sub, trend }: Props) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}>
          <Icon size={22} style={{ color }} />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>

      <div className="text-3xl font-heading font-bold text-gray-900 leading-none mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
