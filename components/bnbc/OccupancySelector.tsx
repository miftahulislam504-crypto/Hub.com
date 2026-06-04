// components/bnbc/OccupancySelector.tsx
'use client'
import { OCCUPANCY_TYPES, RISK_CATEGORIES } from '@/lib/types/bnbc.types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export default function OccupancySelector({ value, onChange }: Props) {
  const selected = OCCUPANCY_TYPES.find(o => o.code === value)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OCCUPANCY_TYPES.map(occ => {
          const isSelected = value === occ.code
          return (
            <button key={occ.code} type="button"
              onClick={() => onChange(occ.code)}
              className={`rounded-xl border-2 p-3 text-left transition-all
                ${isSelected ? 'shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
              style={isSelected ? { borderColor: occ.color, backgroundColor: occ.color + '12' } : {}}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm font-heading"
                  style={{ color: isSelected ? occ.color : '#374151' }}>
                  Type {occ.code}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md text-white font-semibold"
                  style={{ backgroundColor: occ.color }}>
                  Cat. {occ.riskCategory}
                </span>
              </div>
              <div className="font-semibold text-gray-900 text-sm">{occ.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{occ.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Risk category info */}
      {selected && (() => {
        const risk = RISK_CATEGORIES.find(r => r.code === selected.riskCategory)!
        return (
          <div className="rounded-xl p-3 border text-sm flex items-start gap-2"
            style={{ backgroundColor: risk.color + '10', borderColor: risk.color + '30' }}>
            <span className="font-bold px-2 py-0.5 rounded-lg text-white text-xs"
              style={{ backgroundColor: risk.color }}>
              {risk.label}
            </span>
            <span style={{ color: risk.color }}>{risk.desc}</span>
          </div>
        )
      })()}
    </div>
  )
}
