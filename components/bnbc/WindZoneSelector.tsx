// components/bnbc/WindZoneSelector.tsx
'use client'
import { WIND_ZONES } from '@/lib/types/bnbc.types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export default function WindZoneSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {WIND_ZONES.map(zone => {
        const selected = value === zone.code
        return (
          <button key={zone.code} type="button"
            onClick={() => onChange(zone.code)}
            className={`rounded-xl border-2 p-4 text-left transition-all
              ${selected ? 'shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            style={selected ? { borderColor: zone.color, backgroundColor: zone.color + '0D' } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-heading text-lg"
                style={{ color: selected ? zone.color : '#374151' }}>
                {zone.label}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
                style={{ borderColor: selected ? zone.color : '#D1D5DB' }}>
                {selected && <div className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: zone.color }} />}
              </div>
            </div>

            {/* Wind speed */}
            <div className="text-2xl font-bold font-heading mb-1"
              style={{ color: zone.color }}>
              {zone.speed}
              <span className="text-sm font-normal text-gray-500 ml-1">km/h</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">{zone.desc}</p>
          </button>
        )
      })}
    </div>
  )
}
