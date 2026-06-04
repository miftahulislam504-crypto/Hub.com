// components/bnbc/BNBCSummary.tsx
'use client'
import { BNBCSettings, SEISMIC_ZONES, WIND_ZONES, OCCUPANCY_TYPES } from '@/lib/types/bnbc.types'
import { Edit2 } from 'lucide-react'

interface Props {
  info: BNBCSettings
  onEdit: () => void
}

export default function BNBCSummary({ info, onEdit }: Props) {
  const seismicZone  = SEISMIC_ZONES.find(z => z.code === info.seismicZone)
  const windZone     = WIND_ZONES.find(w => w.code === info.windZone)
  const occupancy    = OCCUPANCY_TYPES.find(o => o.code === info.occupancyType)

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="section-title">📋 BNBC 2020 সেটিংস</h3>
          <button onClick={onEdit}
            className="flex items-center gap-1.5 text-sm text-primary-900 hover:underline font-medium">
            <Edit2 size={14} /> সম্পাদনা
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          <Row label="Occupancy Type">
            <span className="font-bold text-white px-2 py-0.5 rounded-lg text-sm"
              style={{ backgroundColor: occupancy?.color }}>
              Type {info.occupancyType}
            </span>
            <span className="ml-2 text-gray-700">{occupancy?.name}</span>
          </Row>
          <Row label="Risk Category">
            <span className="font-semibold">Category {info.riskCategory}</span>
          </Row>
          <Row label="Seismic Zone">
            <span className="font-bold" style={{ color: seismicZone?.color }}>
              {seismicZone?.label}
            </span>
            <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-lg">
              Z = {info.seismicZoneCoeff}
            </span>
          </Row>
          <Row label="Wind Zone">
            <span className="font-bold" style={{ color: windZone?.color }}>
              {windZone?.label}
            </span>
            <span className="ml-2 text-gray-500 text-sm">{info.basicWindSpeed} km/h</span>
          </Row>
          <Row label="Live Load">
            <span className="font-medium">{info.liveLoadType}</span>
            <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-lg">
              {info.liveLoadValue} kN/m²
            </span>
          </Row>
          <Row label="Structural System">
            <span className="text-sm text-gray-700">{info.structuralSystem}</span>
            <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-lg">
              R = {info.responseModFactor}
            </span>
          </Row>
        </div>
      </div>

      {/* Computed results */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 bg-primary-900">
          <h3 className="font-heading font-bold text-white flex items-center gap-2">
            ⚡ Computed Values
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          <Row label="Importance Factor (I)">
            <span className="font-mono font-bold text-primary-900 text-lg">
              {info.importanceFactor.toFixed(2)}
            </span>
          </Row>
          <Row label="Spectral Acc (Ss)">
            <span className="font-mono font-bold text-primary-900 text-lg">
              {info.spectralAcceleration.toFixed(3)}
            </span>
            <span className="text-gray-400 text-sm ml-1">g</span>
          </Row>
          <Row label="Seismic Cs">
            <span className="font-mono font-bold text-primary-900 text-lg">
              {((info.spectralAcceleration * info.importanceFactor) / info.responseModFactor).toFixed(4)}
            </span>
            <span className="text-gray-400 text-sm ml-1">g</span>
          </Row>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-36 text-sm text-gray-500 flex-shrink-0">{label}</div>
      <div className="flex flex-wrap items-center gap-1 flex-1">{children}</div>
    </div>
  )
}
