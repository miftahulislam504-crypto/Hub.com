// components/dashboard/CompletionProgress.tsx
'use client'

interface Props {
  label: string
  value: number
  total: number
  color: string
}

export default function CompletionProgress({ label, value, total, color }: Props) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value} <span className="text-gray-400 font-normal text-xs">/ {total}</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-gray-400 text-right">{pct}%</div>
    </div>
  )
}
