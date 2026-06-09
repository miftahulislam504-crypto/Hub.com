// app/dashboard/activity/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useActivityStore } from '@/store/useActivityStore'
import { useProjectStore }  from '@/store/useProjectStore'
import { useAuthStore }     from '@/store/useAuthStore'
import { groupByDate, ACTION_META } from '@/lib/types/activity.types'
import TimelineItem from '@/components/activity/TimelineItem'
import { Clock, ArrowLeft, Loader2 } from 'lucide-react'

export default function ActivityPage() {
  const { user }                             = useAuthStore()
  const { projects, fetchProjects }          = useProjectStore()
  const { allLogs, loading, fetchAll }       = useActivityStore()
  const [filter, setFilter]                  = useState('all')
  const [dateFilter, setDateFilter]          = useState('all')

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user, fetchProjects])

  useEffect(() => {
    if (projects.length) fetchAll(projects.map(p => p.id))
  }, [projects, fetchAll])

  // Project name lookup
  const projectName = (id: string) =>
    projects.find(p => p.id === id)?.projectName ?? id

  // Date filter options
  const now     = new Date()
  const today   = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const week    = new Date(today.getTime() - 7  * 86400000)
  const month   = new Date(today.getTime() - 30 * 86400000)

  let logs = allLogs
  if (dateFilter === 'today') logs = logs.filter(l => l.timestamp >= today)
  if (dateFilter === 'week')  logs = logs.filter(l => l.timestamp >= week)
  if (dateFilter === 'month') logs = logs.filter(l => l.timestamp >= month)
  if (filter !== 'all')       logs = logs.filter(l => l.action === filter)

  const grouped  = groupByDate(logs)
  const dateKeys = Object.keys(grouped)
  const actionTypes = Array.from(new Set(allLogs.map(l => l.action)))

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <Clock size={22} className="text-primary-900" /> সব কার্যক্রম
          </h1>
          <p className="text-gray-500 text-sm">{allLogs.length}টি মোট কার্যক্রম</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        {/* Date filter */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">সময়কাল</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { v: 'all',   l: 'সব সময়' },
              { v: 'today', l: 'আজ' },
              { v: 'week',  l: 'শেষ ৭ দিন' },
              { v: 'month', l: 'শেষ ৩০ দিন' },
            ].map(opt => (
              <button key={opt.v}
                onClick={() => setDateFilter(opt.v)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all
                  ${dateFilter === opt.v
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                  }`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Action filter */}
        {actionTypes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">ধরন</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all
                  ${filter === 'all'
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-gray-600 border-gray-100'
                  }`}>
                সব
              </button>
              {actionTypes.map(action => {
                const meta = ACTION_META[action]
                if (!meta) return null
                return (
                  <button key={action}
                    onClick={() => setFilter(action)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all
                      ${filter === action ? 'text-white border-transparent' : 'bg-white border-gray-100'}`}
                    style={filter === action
                      ? { backgroundColor: meta.color }
                      : { color: meta.color }
                    }>
                    {meta.icon} {meta.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-900" size={36} />
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="card py-16 text-center">
          <Clock size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">এই সময়ে কোনো কার্যক্রম নেই</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map(dateKey => {
            const dayLogs = grouped[dateKey]
            return (
              <div key={dateKey} className="card overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">📅 {dateKey}</span>
                  <span className="text-xs text-gray-400">{dayLogs.length}টি</span>
                </div>
                <div className="px-5 pt-4 pb-1">
                  {dayLogs.map((log, i) => (
                    <TimelineItem
                      key={log.id}
                      log={log}
                      isLast={i === dayLogs.length - 1}
                      showProject={projectName(log.projectId)}
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
