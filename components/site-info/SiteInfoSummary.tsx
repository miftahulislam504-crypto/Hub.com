// components/site-info/SiteInfoSummary.tsx
'use client'
import { SiteInfo, SOIL_TYPES, toSqft, toKatha } from '@/lib/types/site-info.types'
import { MapPin, Layers, Square, GitBranch, Navigation, Droplets, Edit2 } from 'lucide-react'

interface Props {
  info: SiteInfo
  onEdit: () => void
}

export default function SiteInfoSummary({ info, onEdit }: Props) {
  const soil = SOIL_TYPES.find(s => s.code === info.soilType)

  const sqft  = info.plotArea ? toSqft(info.plotArea, info.plotAreaUnit).toFixed(0) : null
  const katha = info.plotArea ? toKatha(info.plotArea, info.plotAreaUnit).toFixed(2) : null

  const roadLabel: Record<string, string> = {
    paved: 'পাকা রাস্তা', unpaved: 'কাঁচা রাস্তা', both: 'পাকা ও কাঁচা',
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h3 className="section-title"><MapPin size={16} /> সাইট ইনফরমেশন</h3>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-primary-900 hover:underline font-medium">
          <Edit2 size={14} /> সম্পাদনা
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {/* Address */}
        <Row icon={<MapPin size={15} />} label="ঠিকানা">
          <span className="font-medium">{info.address}</span>
          <span className="text-gray-500">, {info.upazila}, {info.district}</span>
        </Row>

        {/* Soil type */}
        <Row icon={<Layers size={15} />} label="মাটির ধরন (BNBC)">
          <span
            className="font-bold px-2 py-0.5 rounded-lg text-white text-sm"
            style={{ backgroundColor: soil?.color }}
          >
            {info.soilType}
          </span>
          <span className="ml-2 text-gray-700">{soil?.name}</span>
          <span className="text-gray-400 text-sm ml-1">({soil?.nameEn})</span>
        </Row>

        {/* Plot area */}
        {info.plotArea && (
          <Row icon={<Square size={15} />} label="প্লট এরিয়া">
            <span className="font-medium">{info.plotArea} {info.plotAreaUnit}</span>
            {info.plotAreaUnit !== 'sqft'  && <span className="text-gray-400 text-sm ml-2">≈ {sqft} sqft</span>}
            {info.plotAreaUnit !== 'katha' && <span className="text-gray-400 text-sm ml-2">≈ {katha} কাঠা</span>}
          </Row>
        )}

        {/* Road */}
        {info.roadWidth && (
          <Row icon={<GitBranch size={15} />} label="রাস্তার প্রশস্ততা">
            <span className="font-medium">{info.roadWidth} মিটার</span>
            {info.roadType && (
              <span className="text-gray-500 ml-2">({roadLabel[info.roadType]})</span>
            )}
          </Row>
        )}

        {/* GPS */}
        <Row icon={<Navigation size={15} />} label="GPS">
          {info.latitude && info.longitude ? (
            <span className="font-mono text-sm text-green-700">
              {info.latitude.toFixed(6)}, {info.longitude.toFixed(6)}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">দেওয়া হয়নি</span>
          )}
        </Row>

        {/* Levels */}
        {(info.groundLevel || info.floodLevel || info.groundwaterDepth) && (
          <Row icon={<Droplets size={15} />} label="উচ্চতা / স্তর">
            <div className="space-y-0.5 text-sm">
              {info.groundLevel      && <div>ভূমি উচ্চতা (MSL): <b>{info.groundLevel} m</b></div>}
              {info.floodLevel       && <div className="text-yellow-700">বন্যা স্তর: <b>{info.floodLevel} m</b></div>}
              {info.groundwaterDepth && <div>ভূগর্ভস্থ পানি: <b>{info.groundwaterDepth} m</b></div>}
            </div>
          </Row>
        )}

        {/* Notes */}
        {info.notes && (
          <Row icon={<span className="text-sm">📝</span>} label="মন্তব্য">
            <span className="text-gray-700 text-sm">{info.notes}</span>
          </Row>
        )}
      </div>
    </div>
  )
}

function Row({ icon, label, children }: {
  icon: React.ReactNode, label: string, children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-shrink-0 w-32 text-sm text-gray-500">{label}</div>
      <div className="flex-1 flex flex-wrap items-center gap-1">{children}</div>
    </div>
  )
}
