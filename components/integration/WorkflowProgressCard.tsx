// components/integration/WorkflowProgressCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { hub } from '@/lib/hub-sdk'
import {
  WorkflowState, WORKFLOW_STAGE_ORDER, WORKFLOW_STAGE_LABELS_BN, APP_CHECK_PATHS,
} from '@/lib/types/workflow.types'
import { CheckCircle2, Circle, Loader2, Milestone } from 'lucide-react'

interface Props {
  projectId: string
}

const DOWNSTREAM_APPS: { key: keyof typeof APP_CHECK_PATHS; label: string }[] = [
  { key: 'architectural', label: 'Architectural' },
  { key: 'structural',    label: 'Structural' },
  { key: 'estimating',    label: 'Estimating' },
  { key: 'projectmgmt',   label: 'Project Management' },
]

type AppSignal = 'no_signal' | 'not_touched' | 'touched' | 'checking'

export default function WorkflowProgressCard({ projectId }: Props) {
  const [state, setState]       = useState<WorkflowState | null>(null)
  const [appSignals, setAppSignals] = useState<Record<string, AppSignal>>({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const [workflowState, ...signals] = await Promise.all([
        hub.getWorkflowState(projectId),
        ...DOWNSTREAM_APPS.map(async app => {
          const checkPath = APP_CHECK_PATHS[app.key]
          if (!checkPath) return 'no_signal' as AppSignal
          const exists = await hub.checkAppTouched(projectId, checkPath)
          return exists === null ? 'no_signal' : exists ? 'touched' : 'not_touched'
        }),
      ])

      if (cancelled) return
      setState(workflowState)
      setAppSignals(Object.fromEntries(DOWNSTREAM_APPS.map((a, i) => [a.key, signals[i]])))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  if (loading || !state) {
    return <div className="card p-5 flex items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={20} />
    </div>
  }

  const currentIndex = WORKFLOW_STAGE_ORDER.indexOf(state.currentStage)

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="section-title flex items-center gap-2">
          <Milestone size={16} /> Project Workflow
        </h3>
        {state.blockedReason && (
          <p className="text-xs text-amber-600 mt-1">{state.blockedReason}</p>
        )}
      </div>

      {/* Sequential stage stepper — এটা কড়াভাবে sequential, আগের স্টেজ
          ছাড়া পরেরটা কখনো ✓ দেখাবে না */}
      <div className="px-5 py-4 space-y-2.5">
        {WORKFLOW_STAGE_ORDER.map((stage, i) => {
          const reached = i <= currentIndex
          return (
            <div key={stage} className="flex items-center gap-2.5">
              {reached
                ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                : <Circle size={16} className="text-gray-200 flex-shrink-0" />
              }
              <span className={`text-xs ${reached ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {WORKFLOW_STAGE_LABELS_BN[stage]}
              </span>
            </div>
          )
        })}
      </div>

      {/* App-level signal — সংখ্যায় % দেখানো হয়নি ইচ্ছাকৃতভাবে; যে ৪টা
          App-এর কোনো real progress-reporting mechanism নেই (শুধু
          existence-check বা তাও নেই), তাদের জন্য fake percentage দেখানো
          বিভ্রান্তিকর হতো। */}
      <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50">
        <p className="text-xs font-semibold text-gray-500 mb-2.5">App-ভিত্তিক সংকেত</p>
        <div className="space-y-2">
          {DOWNSTREAM_APPS.map(app => {
            const signal = appSignals[app.key] ?? 'no_signal'
            return (
              <div key={app.key} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{app.label}</span>
                {signal === 'touched' && (
                  <span className="text-green-600 font-medium">ছোঁয়া হয়েছে</span>
                )}
                {signal === 'not_touched' && (
                  <span className="text-gray-400">যাচাই করা হয়েছে — এখনো না</span>
                )}
                {signal === 'no_signal' && (
                  <span className="text-gray-300">কোনো সংকেত নেই</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
