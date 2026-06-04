// components/site-info/PlotAreaInput.tsx
'use client'
import { PLOT_UNITS, toSqm, toSqft, toKatha } from '@/lib/types/site-info.types'

interface Props {
  area?: number
  unit: string
  onAreaChange: (v: number | undefined) => void
  onUnitChange: (v: string) => void
}

export default function PlotAreaInput({ area, unit, onAreaChange, onUnitChange }: Props) {
  const sqm   = area ? toSqm(area, unit).toFixed(1)   : null
  const sqft  = area ? toSqft(area, unit).toFixed(0)  : null
  const katha = area ? toKatha(area, unit).toFixed(2) : null

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {/* Value */}
        <input
          type="number"
          min={0}
          step="any"
          value={area ?? ''}
          onChange={e => onAreaChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="পরিমাণ"
          className="input-field flex-1"
        />
        {/* Unit */}
        <select
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="input-field w-36"
        >
          {PLOT_UNITS.map(u => (
            <option key={u.code} value={u.code}>{u.label}</option>
          ))}
        </select>
      </div>

      {/* Conversion */}
      {area && area > 0 && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5
          flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-500">≈</span>
          {unit !== 'sqm'   && <span><b className="text-primary-900">{sqm}</b> sqm</span>}
          {unit !== 'sqft'  && <span><b className="text-primary-900">{sqft}</b> sqft</span>}
          {unit !== 'katha' && <span><b className="text-primary-900">{katha}</b> কাঠা</span>}
        </div>
      )}
    </div>
  )
}
