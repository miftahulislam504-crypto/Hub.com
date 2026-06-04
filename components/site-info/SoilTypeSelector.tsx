// components/site-info/SoilTypeSelector.tsx
'use client'
import { SOIL_TYPES } from '@/lib/types/site-info.types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export default function SoilTypeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-sm text-blue-700">
        <span>ℹ️</span>
        <span>BNBC 2020 অনুযায়ী মাটির ধরন নির্বাচন করুন। Geotechnical রিপোর্ট থাকলে সেটা অনুসরণ করুন।</span>
      </div>

      {SOIL_TYPES.map(soil => {
        const selected = value === soil.code
        return (
          <button
            key={soil.code}
            type="button"
            onClick={() => onChange(soil.code)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all
              ${selected ? 'border-current shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
            style={selected ? {
              borderColor: soil.color,
              backgroundColor: soil.bg,
            } : {}}
          >
            <div className="flex items-start gap-3">
              {/* Code badge */}
              <div
                className="rounded-lg w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                style={{ backgroundColor: selected ? soil.color : '#9CA3AF' }}
              >
                <span className="text-xs opacity-80">BNBC</span>
                <span>{soil.code}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900">{soil.name}</span>
                  <span className="text-xs text-gray-500">({soil.nameEn})</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{soil.desc}</p>
                <p className="text-xs text-gray-400">📍 {soil.example}</p>
              </div>

              {/* Radio */}
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center
                ${selected ? 'border-current' : 'border-gray-300'}`}
                style={selected ? { borderColor: soil.color } : {}}
              >
                {selected && (
                  <div className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: soil.color }} />
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
