// components/integration/ActivityFeedCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { hub } from '@/lib/hub-sdk'
import { HubEvent, EVENT_LABELS_BN } from '@/lib/types/event.types'
import { MODULE_LABELS, ModuleId } from '@/lib/types/dependency.types'
import { Activity, Loader2 } from 'lucide-react'

interface Props {
  projectId: string
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'এইমাত্র'
  if (mins < 60) return `${mins} মিনিট আগে`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ঘণ্টা আগে`
  return `${Math.floor(hrs / 24)} দিন আগে`
}

function describeEvent(e: HubEvent): string {
  const label = EVENT_LABELS_BN[e.type] ?? e.type
  const moduleId = e.payload?.moduleId as ModuleId | undefined
  const moduleName = moduleId ? (MODULE_LABELS[moduleId] ?? moduleId) : null
  return moduleName ? `${moduleName} — ${label}` : label
}

export default function ActivityFeedCard({ projectId }: Props) {
  const [events, setEvents]   = useState<HubEvent[] | null>(null)

  useEffect(() => {
    const unsubscribe = hub.subscribeToEvents(projectId, setEvents, 15)
    return unsubscribe
  }, [projectId])

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="section-title flex items-center gap-2">
          <Activity size={16} /> সাম্প্রতিক কার্যক্রম
        </h3>
      </div>

      {events === null ? (
        <div className="p-5 flex justify-center">
          <Loader2 className="animate-spin text-gray-300" size={18} />
        </div>
      ) : events.length === 0 ? (
        <p className="px-5 py-4 text-xs text-gray-400">এখনো কোনো কার্যক্রম রেকর্ড হয়নি</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {events.map(e => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 text-xs">
              <span className="text-gray-700">{describeEvent(e)}</span>
              <span className="text-gray-400 flex-shrink-0">{timeAgo(e.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
