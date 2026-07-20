// components/dashboard/RecentActivity.tsx
'use client'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useProjectStore } from '@/store/useProjectStore'
import { formatDate } from '@/lib/utils'

interface ActivityItem {
  id:          string
  projectId:   string
  projectName: string
  action:      string
  description: string
  timestamp:   Date
}

const ACTION_ICONS: Record<string, { icon: string; color: string }> = {
  project_created:  { icon: '🆕', color: '#1565C0' },
  project_updated:  { icon: '✏️', color: '#E65100' },
  site_info_saved:  { icon: '📍', color: '#2E7D32' },
  bnbc_saved:       { icon: '📐', color: '#4A148C' },
  building_saved:   { icon: '🏗️', color: '#37474F' },
  document_added:   { icon: '📄', color: '#1565C0' },
  document_deleted: { icon: '🗑️', color: '#B71C1C' },
}

interface Props {
  userId: string
}

export default function RecentActivity({ userId }: Props) {
  const { projects } = useProjectStore()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!projects.length) { setLoading(false); return }
      setLoading(true)

      const results: ActivityItem[] = []

      // Fetch last 3 activity logs from each of last 5 projects
      const recentProjects = projects.slice(0, 5)
      for (const p of recentProjects) {
        try {
          const q = query(
            collection(db, 'projects', p.id, 'activity_logs'),
            orderBy('timestamp', 'desc'),
            limit(3)
          )
          const snap = await getDocs(q)
          snap.docs.forEach(doc => {
            const d = doc.data()
            const ts = d.timestamp instanceof Timestamp
              ? d.timestamp.toDate()
              : new Date()
            results.push({
              id:          doc.id,
              projectId:   p.id,
              projectName: p.projectName,
              action:      d.action ?? '',
              description: d.description ?? '',
              timestamp:   ts,
            })
          })
        } catch (_) { /* skip */ }
      }

      // Sort by time desc, take 10
      results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setActivities(results.slice(0, 10))
      setLoading(false)
    }

    load()
  }, [projects])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 py-1">
              <div className="h-3 bg-gray-100 rounded-md w-3/4" />
              <div className="h-2 bg-gray-100 rounded-md w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities.length) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        এখনো কোনো কার্যক্রম নেই
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {activities.map((act, i) => {
        const style = ACTION_ICONS[act.action] ?? { icon: '📌', color: '#546E7A' }
        return (
          <div key={act.id} className="flex items-start gap-3 py-2.5 group">
            {/* Icon */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ backgroundColor: style.color + '15' }}>
              {style.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">{act.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 truncate">{act.projectName}</span>
                <span className="text-gray-200">•</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            </div>

            {/* Timeline connector */}
            {i < activities.length - 1 && (
              <div className="absolute left-[15px] mt-8 w-0.5 h-full bg-gray-100" />
            )}
          </div>
        )
      })}
    </div>
  )
}
