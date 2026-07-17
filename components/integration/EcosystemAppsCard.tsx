// components/integration/EcosystemAppsCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { hub } from '@/lib/hub-sdk'
import { APP_CHECK_PATHS } from '@/lib/types/workflow.types'
import { CheckCircle, Circle, ExternalLink, Loader2 } from 'lucide-react'

interface AppLiveStatus {
  id:          string
  name:        string
  icon:        string
  url:         string
  // Firestore path (under projects/{id}/...) that proves this app
  // has actually opened/synced this project — null if that link
  // hasn't been built yet (still relies on manual JSON export below)
  checkPath:   string | null
  liveSynced:  'checking' | 'yes' | 'no' | 'unknown'
}

interface Props {
  projectId: string
}

const APPS: Omit<AppLiveStatus, 'liveSynced'>[] = [
  {
    id:        'structural',
    name:      'Structural Analysis & Design',
    icon:      '🏗️',
    url:       'https://enginex-structural.vercel.app',
    checkPath: APP_CHECK_PATHS.structural ?? null,
  },
  {
    id:        'architectural',
    name:      'Architectural Drawing',
    icon:      '📐',
    url:       'https://enginex-archdrawing.vercel.app',
    checkPath: APP_CHECK_PATHS.architectural ?? null, // not yet wired to the shared project ID — manual export below
  },
  {
    id:        'estimating',
    name:      'Estimating, Costing & BOQ',
    icon:      '📋',
    url:       'https://enginex-estimate.vercel.app',
    checkPath: APP_CHECK_PATHS.estimating ?? null,
  },
  {
    id:        'projectmgmt',
    name:      'Project Management',
    icon:      '📊',
    url:       'https://enginex-pm.vercel.app',
    checkPath: APP_CHECK_PATHS.projectmgmt ?? null,
  },
  {
    id:        'reports',
    name:      'Reports App',
    icon:      '📑',
    url:       'https://enginex-reports.vercel.app',
    checkPath: APP_CHECK_PATHS.reports ?? null,
  },
]

export default function EcosystemAppsCard({ projectId }: Props) {
  const [statuses, setStatuses] = useState<AppLiveStatus[]>(
    APPS.map(a => ({ ...a, liveSynced: a.checkPath ? 'checking' : 'unknown' }))
  )

  useEffect(() => {
    // Event Service (Phase 5) — আগে এখানে একবার mount হলে check হতো
    // (one-time getDoc)। এখন প্রতিটা App-এর জন্য আলাদা realtime
    // onSnapshot subscription — Structural App যদি এই পেজ খোলা অবস্থায়
    // কখনো নিজের ডেটা লেখে, UI সাথে সাথে আপডেট হবে, refresh লাগবে না।
    const unsubscribers = APPS.map((app, index) => {
      if (!app.checkPath) return () => {}

      return hub.subscribeToAppTouched(projectId, app.checkPath, (exists) => {
        const liveSynced: AppLiveStatus['liveSynced'] =
          exists === null ? 'unknown' : exists ? 'yes' : 'no'
        setStatuses(prev => {
          const next = [...prev]
          next[index] = { ...next[index], liveSynced }
          return next
        })
      })
    })

    return () => { unsubscribers.forEach(unsub => unsub()) }
  }, [projectId])

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="section-title">🌐 Ecosystem App Status</h3>
        <p className="text-xs text-gray-500 mt-1">
          এই প্রজেক্ট অন্য App-এ খোলা/sync হয়েছে কিনা — সরাসরি shared Firestore থেকে যাচাই করা
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        {statuses.map(app => (
          <div key={app.id} className="flex items-center gap-3 px-5 py-3.5">
            <span className="text-xl flex-shrink-0">{app.icon}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{app.name}</p>
              <p className="text-xs mt-0.5">
                {app.liveSynced === 'checking' && (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin" /> যাচাই হচ্ছে...
                  </span>
                )}
                {app.liveSynced === 'yes' && (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> এই App-এ project খোলা হয়েছে
                  </span>
                )}
                {app.liveSynced === 'no' && (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Circle size={12} /> এখনো খোলা হয়নি — App-এ গেলে Hub-এর তথ্য দিয়ে স্বয়ংক্রিয়ভাবে শুরু হবে
                  </span>
                )}
                {app.liveSynced === 'unknown' && (
                  <span className="text-amber-600">
                    এখনো শুধু manual JSON export — নিচে থেকে download করে নিন
                  </span>
                )}
              </p>
            </div>

            <a
              href={`${app.url}${app.checkPath ? `/project/${projectId}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-primary-900
                hover:underline flex-shrink-0"
            >
              খুলুন <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
