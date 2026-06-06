// components/activity/ActivityTab.tsx
'use client'
import { useEffect, useState } from 'react'
import { useActivityStore } from '@/store/useActivityStore'
import { groupByDate, ACTION_META } from '@/lib/types/activity.types'
import TimelineItem from './TimelineItem'
import { Clock, Loader2, Filter } from 'lucide-react'

interface Props { projectId: string }

export default function ActivityTab({ projectId }: Props) {
  const { projectLogs, loading, fetchProject } = useActivityStore()
  const [filter, setFilter] = useState<string>('all')

  const logs = projectLogs[projectId] ?? []

  useEffect(() => { fetchProject(projectId) }, [projectId, fetchProject])

  const filtered = filter === 'all'
    ? logs
    : logs.filter(l => l.action === filter)

  const grouped = groupByDate(filtered)
  const dateKeys = Object.keys(grouped)

  const actionTypes = [...new Set(logs.map(l => l.action))]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-primary-900" /> কার্যক্রমের ইতিহাস
        </h2>
        <span className="text-xs text-gray-400">{logs.length}টি কার্যক্রম</span>
      </div>

      {/* Filter */}
      {actionTypes.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <FilterBtn
            label="সব"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            color="#374151"
          />
          {actionTypes.map(action => {
            const meta = ACTION_META[action]
            if (!meta) return null
            return (
              <FilterBtn
                key={action}
                label={`${meta.icon} ${meta.label}`}
                active={filter === action}
                onClick={() => setFilter(action)}
                color={meta.color}
              />
            )
          })}
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-900" size={32} />
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="card py-16 text-center">
          <Clock size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">কোনো কার্যক্রম নেই</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map(dateKey => {
            const dayLogs = grouped[dateKey]
            return (
              <div key={dateKey} className="card overflow-hidden">
                {/* Date header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">📅 {dateKey}</span>
                </div>

                {/* Items */}
                <div className="px-5 pt-4 pb-1">
                  {dayLogs.map((log, i) => (
                    <TimelineItem
                      key={log.id}
                      log={log}
                      isLast={i === dayLogs.length - 1}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterBtn({
  label, active, onClick, color,
}: {
  label: string; active: boolean; onClick: () => void; color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all
        ${active ? 'text-white border-transparent' : 'bg-white border-gray-100 hover:border-gray-200'}`}
      style={active ? { backgroundColor: color, borderColor: color } : { color }}
    >
      {label}
    </button>
  )
}
