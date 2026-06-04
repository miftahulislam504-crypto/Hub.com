// components/building/BuildingSummary.tsx
'use client'
import { BuildingInfo, BUILDING_TYPES } from '@/lib/types/building.types'
import { Edit2 } from 'lucide-react'

interface Props {
  info: BuildingInfo
  onEdit: () => void
}

export default function BuildingSummary({ info, onEdit }: Props) {
  const buildingType = BUILDING_TYPES.find(t => t.code === info.buildingType)

  const amenities = [
    { label: 'লিফট',           active: info.hasLift,          icon: '🛗' },
    { label: 'জেনারেটর',       active: info.hasGenerator,     icon: '⚡' },
    { label: 'পানির ট্যাংক',   active: info.hasWaterTank,     icon: '💧' },
    { label: 'পার্কিং ফ্লোর',  active: info.hasParkingFloor,  icon: '🚗' },
  ]

  return (
    <div className="space-y-4">
      {/* Main card */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="section-title">🏗️ ভবনের তথ্য</h3>
          <button onClick={onEdit}
            className="flex items-center gap-1.5 text-sm text-primary-900 hover:underline font-medium">
            <Edit2 size={14} /> সম্পাদনা
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {/* Building type */}
          <Row label="ভবনের ধরন">
            <span className="text-xl">{buildingType?.icon}</span>
            <span className="font-bold ml-1" style={{ color: buildingType?.color }}>
              {buildingType?.name}
            </span>
            <span className="text-gray-400 text-sm ml-1">({buildingType?.nameEn})</span>
          </Row>

          {/* Usage */}
          <Row label="ব্যবহার">
            <span className="text-gray-800">{info.usageType}</span>
          </Row>

          {/* Floors */}
          <Row label="তলার সংখ্যা">
            <span className="font-bold text-primary-900 text-lg font-heading">
              {info.numFloors}
            </span>
            <span className="text-gray-500 text-sm ml-1">তলা</span>
            {info.basementCount > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-lg">
                + {info.basementCount} বেসমেন্ট
              </span>
            )}
          </Row>

          {/* Total height */}
          <Row label="মোট উচ্চতা">
            <span className="font-bold text-primary-900 text-lg font-heading">
              {info.totalHeight}
            </span>
            <span className="text-gray-500 text-sm ml-1">মিটার</span>
            <span className="text-gray-400 text-xs ml-2">
              (GF: {info.groundFloorHeight}m + TF: {info.floorHeight}m)
            </span>
          </Row>

          {/* Dimensions */}
          {info.buildingLength && info.buildingWidth && (
            <Row label="মাপ (L × W)">
              <span className="font-medium">{info.buildingLength} × {info.buildingWidth} m</span>
              {info.totalFloorArea && (
                <span className="ml-2 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-lg">
                  মোট এরিয়া: {info.totalFloorArea} m²
                </span>
              )}
            </Row>
          )}

          {/* Roof */}
          <Row label="ছাদের ধরন">
            <span className="text-gray-800">{info.roofType} Roof</span>
          </Row>
        </div>
      </div>

      {/* Amenities */}
      <div className="card p-5">
        <h3 className="section-title mb-4">🛗 সুবিধাদি</h3>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map(a => (
            <div key={a.label}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm
                ${a.active
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-gray-50 border border-gray-100 text-gray-400'
                }`}>
              <span>{a.icon}</span>
              <span className="font-medium">{a.label}</span>
              {a.active
                ? <span className="ml-auto text-green-600 text-xs font-bold">✓ আছে</span>
                : <span className="ml-auto text-gray-300 text-xs">নেই</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {info.notes && (
        <div className="card p-5">
          <h3 className="section-title mb-2">📝 মন্তব্য</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{info.notes}</p>
        </div>
      )}

      {/* Export hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 flex gap-2">
        <span>💡</span>
        <span>এই ডেটা Structural, Design ও BOQ App স্বয়ংক্রিয়ভাবে ব্যবহার করবে।</span>
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
