// components/integration/DataReadinessCard.tsx
'use client'
import Link from 'next/link'
import { HubExportPayload } from '@/lib/types/integration.types'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface Props {
  payload:   HubExportPayload
  projectId: string
}

export default function DataReadinessCard({ payload, projectId }: Props) {
  const checks = [
    {
      label:    'সাইট ইনফরমেশন',
      done:     !!payload.siteInfo,
      href:     `/dashboard/projects/${projectId}?tab=site`,
      details:  payload.siteInfo
        ? `${payload.siteInfo.district}, মাটি: ${payload.siteInfo.soilType}`
        : 'পূরণ করা হয়নি',
    },
    {
      label:    'BNBC সেটিংস',
      done:     !!payload.bnbcSettings,
      href:     `/dashboard/projects/${projectId}?tab=bnbc`,
      details:  payload.bnbcSettings
        ? `Zone ${payload.bnbcSettings.seismicZone}, I=${payload.bnbcSettings.importanceFactor}`
        : 'পূরণ করা হয়নি',
    },
    {
      label:    'ভবনের তথ্য',
      done:     !!payload.buildingInfo,
      href:     `/dashboard/projects/${projectId}?tab=building`,
      details:  payload.buildingInfo
        ? `${payload.buildingInfo.buildingType}, ${payload.buildingInfo.numFloors} তলা`
        : 'পূরণ করা হয়নি',
    },
  ]

  const doneCount = checks.filter(c => c.done).length

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="section-title">📋 ডেটার অবস্থা</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full
          ${doneCount === 3
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
          }`}>
          {doneCount}/3 সম্পূর্ণ
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {checks.map(check => (
          <div key={check.label} className="flex items-center gap-3 px-5 py-3.5">
            {/* Status icon */}
            {check.done
              ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              : <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
            }

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{check.label}</p>
              <p className={`text-xs mt-0.5 ${check.done ? 'text-gray-500' : 'text-amber-600'}`}>
                {check.details}
              </p>
            </div>

            {/* Action */}
            {!check.done && (
              <Link href={check.href}
                className="text-xs text-primary-900 font-semibold flex items-center
                  gap-1 hover:underline flex-shrink-0">
                পূরণ করুন <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
