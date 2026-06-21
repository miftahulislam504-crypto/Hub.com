// components/integration/EcosystemAppsCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
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
    checkPath: 'structuralData/civp',
  },
  {
    id:        'architectural',
    name:      'Architectural Drawing',
    icon:      '📐',
    url:       'https://enginex-archdrawing.vercel.app',
    checkPath: null, // not yet wired to the shared project ID — manual export below
  },
  {
    id:        'estimating',
    name:      'Estimating, Costing & BOQ',
    icon:      '📋',
    url:       'https://enginex-estimate.vercel.app',
    checkPath: null,
  },
  {
    id:        'projectmgmt',
    name:      'Project Management',
    icon:      '📊',
    url:       'https://enginex-pm.vercel.app',
    checkPath: null,
  },
  {
    id:        'reports',
    name:      'Reports App',
    icon:      '📑',
    url:       'https://enginex-reports.vercel.app',
    checkPath: null,
  },
]

export default function EcosystemAppsCard({ projectId }: Props) {
  const [statuses, setStatuses] = useState<AppLiveStatus[]>(
    APPS.map(a => ({ ...a, liveSynced: a.checkPath ? 'checking' : 'unknown' }))
  )

  useEffect(() => {
    let cancelled = false

    async function check() {
      const results = await Promise.all(
        APPS.map(async (app) => {
          if (!app.checkPath) return { ...app, liveSynced: 'unknown' as const }
          try {
            const parts = app.checkPath.split('/') // e.g. ['structuralData', 'civp']
            const snap  = await getDoc(doc(db, 'projects', projectId, parts[0], parts[1]))
            return { ...app, liveSynced: (snap.exists() ? 'yes' : 'no') as const }
          } catch {
            return { ...app, liveSynced: 'unknown' as const }
          }
        })
      )
      if (!cancelled) setStatuses(results)
    }

    check()
    return () => { cancelled = true }
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
