// components/integration/ReportsCenterCard.tsx
'use client'
import { useEffect, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { hub } from '@/lib/hub-sdk'
import {
  HubReport, ReportType, REPORT_TYPES_BY_MODULE, REPORT_TYPE_LABELS_BN,
} from '@/lib/types/report.types'
import { ModuleId, MODULE_LABELS } from '@/lib/types/dependency.types'
import { FileText, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react'

interface Props {
  projectId: string
  user: FirebaseUser | null
}

// শুধু এই ৩টা module-এর real generator আছে (Phase 7 স্কোপ — দেখুন PHASE7_NOTES.md)
const GENERATABLE: Partial<Record<ModuleId, (projectId: string) => Promise<HubReport | null>>> = {
  siteInfo:     hub.generateSiteInfoSummary,
  bnbcSettings: hub.generateBnbcParametersReport,
  buildingInfo: hub.generateBuildingInfoSummary,
}

const MODULE_ORDER: ModuleId[] = [
  'siteInfo', 'bnbcSettings', 'buildingInfo',
  'architectural', 'structural', 'estimating', 'projectmgmt',
]

export default function ReportsCenterCard({ projectId }: Props) {
  const [reports, setReports] = useState<Record<string, HubReport>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<ReportType | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    const all = await hub.getProjectReports(projectId)
    setReports(Object.fromEntries(all.map(r => [r.type, r])))
    setLoading(false)
  }

  useEffect(() => { refresh() }, [projectId])

  async function handleGenerate(moduleId: ModuleId) {
    const generator = GENERATABLE[moduleId]
    if (!generator) return
    const types = REPORT_TYPES_BY_MODULE[moduleId]
    setGenerating(types[0])
    try {
      await generator(projectId)
      await refresh()
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return <div className="card p-5 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={20} />
    </div>
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="section-title flex items-center gap-2">
          <FileText size={16} /> Reports
        </h3>
      </div>

      <div className="divide-y divide-gray-50">
        {MODULE_ORDER.map(moduleId => {
          const types = REPORT_TYPES_BY_MODULE[moduleId]
          const canGenerate = !!GENERATABLE[moduleId]
          const isGeneratingThis = generating && types.includes(generating)

          return (
            <div key={moduleId} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">{MODULE_LABELS[moduleId]}</p>
                {canGenerate && (
                  <button
                    disabled={!!generating}
                    onClick={() => handleGenerate(moduleId)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-900
                      hover:bg-primary-100 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isGeneratingThis
                      ? <Loader2 size={12} className="animate-spin" />
                      : <RefreshCw size={12} />
                    }
                    {reports[types[0]] ? 'আবার তৈরি করুন' : 'তৈরি করুন'}
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pl-1">
                {types.map(type => {
                  const report = reports[type]
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={report ? 'text-gray-700' : 'text-gray-300'}>
                          {REPORT_TYPE_LABELS_BN[type]}
                        </span>
                        {report ? (
                          <button
                            onClick={() => setExpanded(expanded === type ? null : type)}
                            className="text-primary-900 flex items-center gap-1 hover:underline"
                          >
                            v{report.version}
                            {expanded === type ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        ) : (
                          <span className="text-gray-300">
                            {canGenerate ? 'তৈরি হয়নি' : 'কোনো ডেটা উৎস নেই'}
                          </span>
                        )}
                      </div>

                      {report && expanded === type && (
                        <pre className="mt-2 mb-1 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 whitespace-pre-wrap font-sans">
                          {report.content}
                        </pre>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
