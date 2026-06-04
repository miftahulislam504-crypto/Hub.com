// components/bnbc/SeismicZoneSelector.tsx
'use client'
import { SEISMIC_ZONES } from '@/lib/types/bnbc.types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export default function SeismicZoneSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      {SEISMIC_ZONES.map(zone => {
        const selected = value === zone.code
        return (
          <button key={zone.code} type="button"
            onClick={() => onChange(zone.code)}
            className={`w-full text-left rounded-xl border-2 p-3.5 transition-all flex items-start gap-3
              ${selected ? 'shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            style={selected ? { borderColor: zone.color, backgroundColor: zone.color + '0D' } : {}}
          >
            {/* Zone badge */}
            <div className="rounded-xl w-14 h-14 flex flex-col items-center justify-center
              flex-shrink-0 text-white font-bold"
              style={{ backgroundColor: selected ? zone.color : '#9CA3AF' }}>
              <span className="text-xs opacity-80">BNBC</span>
              <span className="text-lg leading-tight">{zone.code}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-gray-900">{zone.label}</span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg">
                  Z = {zone.Z}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">{zone.desc}</div>
              <div className="text-xs text-gray-400">📍 {zone.districts}</div>
            </div>

            {/* Radio */}
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center`}
              style={{ borderColor: selected ? zone.color : '#D1D5DB' }}>
              {selected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />}
            </div>
          </button>
        )
      })}

      {/* Note */}
      <p className="text-xs text-gray-400 text-center pt-1">
        সন্দেহ হলে BNBC 2020 Annex A অনুযায়ী জেলার zone নিশ্চিত করুন।
      </p>
    </div>
  )
}
