// components/integration/ApprovalCard.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { hub } from '@/lib/hub-sdk'
import { UnlockStatus } from '@/lib/firestore/dependency.firestore'
import { ApprovalRecord, ApprovalHistoryEntry, ContractStatus } from '@/lib/types/approval.types'
import { ModuleId, MODULE_LABELS } from '@/lib/types/dependency.types'
import {
  ShieldCheck, ShieldAlert, Clock, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'

interface Props {
  projectId: string
  user: FirebaseUser | null
}

// এখন পর্যন্ত Hub-এর নিজের ৩টা module-ই approval-track করা হয় — বাকি ৪টা
// (architectural, structural, ইত্যাদি) shared model-এ যুক্ত হলে এই list-এ
// যোগ হবে।
const TRACKED_MODULES: ModuleId[] = ['siteInfo', 'bnbcSettings', 'buildingInfo']

const STATUS_STYLE: Record<ContractStatus, { bg: string; text: string; icon: 'ok' | 'warn' }> = {
  DRAFT:             { bg: 'bg-gray-100',   text: 'text-gray-600',  icon: 'warn' },
  PROCESSING:        { bg: 'bg-blue-100',   text: 'text-blue-700',  icon: 'warn' },
  READY_FOR_REVIEW:  { bg: 'bg-amber-100',  text: 'text-amber-700', icon: 'warn' },
  REVIEWED:          { bg: 'bg-indigo-100', text: 'text-indigo-700',icon: 'warn' },
  APPROVED:          { bg: 'bg-green-100',  text: 'text-green-700', icon: 'ok'   },
  OUTDATED:          { bg: 'bg-red-100',    text: 'text-red-700',   icon: 'warn' },
  REJECTED:          { bg: 'bg-red-100',    text: 'text-red-700',   icon: 'warn' },
}

const STATUS_LABEL_BN: Record<ContractStatus, string> = {
  DRAFT: 'খসড়া', PROCESSING: 'চলমান', READY_FOR_REVIEW: 'রিভিউ-এর অপেক্ষায়',
  REVIEWED: 'রিভিউ হয়েছে', APPROVED: 'অনুমোদিত', OUTDATED: 'পুরনো হয়ে গেছে', REJECTED: 'প্রত্যাখ্যাত',
}

export default function ApprovalCard({ projectId, user }: Props) {
  const [statuses, setStatuses] = useState<Record<string, ApprovalRecord | null>>({})
  const [locks, setLocks]       = useState<Record<string, UnlockStatus>>({})
  const [loading, setLoading]   = useState(true)
  const [busyModule, setBusyModule] = useState<ModuleId | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<ModuleId | null>(null)
  const [history, setHistory]   = useState<ApprovalHistoryEntry[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    const [statusMap, lockEntries] = await Promise.all([
      hub.getAllApprovalStatuses(projectId, TRACKED_MODULES),
      Promise.all(TRACKED_MODULES.map(async m => [m, await hub.isModuleUnlocked(projectId, m)] as const)),
    ])
    setStatuses(statusMap)
    setLocks(Object.fromEntries(lockEntries))
    setLoading(false)
  }, [projectId])

  useEffect(() => { refresh() }, [refresh])

  async function handleAction(moduleId: ModuleId, status: ContractStatus) {
    if (!user) return
    setBusyModule(moduleId)
    try {
      const version = await hub.getModuleVersion(projectId, moduleId)
      await hub.setApprovalStatus(
        projectId, moduleId, status,
        version?.currentVersion ?? 1,
        { uid: user.uid, email: user.email, displayName: user.displayName }
      )
      await refresh()
    } finally {
      setBusyModule(null)
    }
  }

  async function toggleHistory(moduleId: ModuleId) {
    if (expandedHistory === moduleId) {
      setExpandedHistory(null)
      return
    }
    const h = await hub.getApprovalHistory(projectId, moduleId)
    setHistory(h)
    setExpandedHistory(moduleId)
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
          <ShieldCheck size={16} /> Approval Status
        </h3>
      </div>

      <div className="divide-y divide-gray-50">
        {TRACKED_MODULES.map(moduleId => {
          const record = statuses[moduleId]
          const status = record?.status ?? 'DRAFT'
          const style  = STATUS_STYLE[status]
          const lock   = locks[moduleId]
          const busy   = busyModule === moduleId

          return (
            <div key={moduleId} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{MODULE_LABELS[moduleId]}</p>
                  {record && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      v{record.approvedVersion} · {record.actedBy?.displayName ?? record.actedBy?.email ?? 'অজানা'}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${style.bg} ${style.text}`}>
                  {STATUS_LABEL_BN[status]}
                </span>
              </div>

              {/* Soft lock note — তথ্যমূলক, form/tab block করে না */}
              {lock && !lock.unlocked && (
                <p className="text-xs text-amber-600 mt-2 flex items-start gap-1.5">
                  <ShieldAlert size={13} className="flex-shrink-0 mt-0.5" />
                  {lock.blockedBy.map(m => MODULE_LABELS[m]).join(', ')} এখনো Approved হয়নি
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  disabled={busy || !user}
                  onClick={() => handleAction(moduleId, 'REVIEWED')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700
                    hover:bg-indigo-100 disabled:opacity-40"
                >
                  রিভিউ সম্পন্ন
                </button>
                <button
                  disabled={busy || !user}
                  onClick={() => handleAction(moduleId, 'APPROVED')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700
                    hover:bg-green-100 disabled:opacity-40"
                >
                  অনুমোদন করুন
                </button>
                <button
                  disabled={busy || !user}
                  onClick={() => handleAction(moduleId, 'REJECTED')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700
                    hover:bg-red-100 disabled:opacity-40"
                >
                  প্রত্যাখ্যান
                </button>
                {busy && <Loader2 className="animate-spin text-gray-300" size={14} />}

                <button
                  onClick={() => toggleHistory(moduleId)}
                  className="text-xs text-gray-400 flex items-center gap-1 ml-auto hover:text-gray-600"
                >
                  <Clock size={12} /> ইতিহাস
                  {expandedHistory === moduleId ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* History */}
              {expandedHistory === moduleId && (
                <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-2">
                  {history.length === 0 && (
                    <p className="text-xs text-gray-400">কোনো ইতিহাস নেই</p>
                  )}
                  {history.map(h => (
                    <div key={h.id} className="text-xs text-gray-500">
                      <span className={`font-semibold ${STATUS_STYLE[h.status].text}`}>
                        {STATUS_LABEL_BN[h.status]}
                      </span>
                      {' '}· v{h.approvedVersion} · {h.actedBy?.displayName ?? h.actedBy?.email ?? 'অজানা'}
                      {h.note && <span className="block text-gray-400 mt-0.5">{h.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
