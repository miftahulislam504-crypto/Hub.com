// components/building/BuildingTypeSelector.tsx
'use client'
import { BUILDING_TYPES } from '@/lib/types/building.types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export default function BuildingTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BUILDING_TYPES.map(type => {
        const selected = value === type.code
        return (
          <button key={type.code} type="button"
            onClick={() => onChange(type.code)}
            className={`rounded-xl border-2 p-4 text-left transition-all
              ${selected ? 'shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            style={selected
              ? { borderColor: type.color, backgroundColor: type.color + '0F' }
              : {}}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-bold text-sm"
              style={{ color: selected ? type.color : '#374151' }}>
              {type.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{type.nameEn}</div>
            <div className="text-xs text-gray-400 mt-1 leading-relaxed">{type.desc}</div>

            {/* Selected indicator */}
            <div className={`mt-2 w-5 h-5 rounded-full border-2 flex items-center justify-center`}
              style={{ borderColor: selected ? type.color : '#D1D5DB' }}>
              {selected && (
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: type.color }} />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
