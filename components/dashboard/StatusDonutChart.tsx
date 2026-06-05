// components/dashboard/StatusDonutChart.tsx
'use client'

interface Segment {
  label: string
  value: number
  color: string
}

interface Props {
  segments: Segment[]
  total: number
  size?: number
}

export default function StatusDonutChart({ segments, total, size = 160 }: Props) {
  const radius  = 54
  const cx      = size / 2
  const cy      = size / 2
  const stroke  = 18
  const circumference = 2 * Math.PI * radius

  // Build arc segments
  let offset = 0
  const arcs = segments
    .filter(s => s.value > 0)
    .map(seg => {
      const pct   = seg.value / (total || 1)
      const dash  = pct * circumference
      const gap   = circumference - dash
      const arc   = { ...seg, dash, gap, offset }
      offset += dash
      return arc
    })

  // If no data
  if (total === 0) {
    return (
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={radius}
            fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={radius}
            fill="none" stroke="#F3F4F6" strokeWidth={stroke} />

          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-heading font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">মোট</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }} />
            {s.label}: <b>{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
