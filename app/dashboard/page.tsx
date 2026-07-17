'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore }    from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { getStatusColor, formatDate } from '@/lib/utils'
import StatCard           from '@/components/dashboard/StatCard'
import StatusDonutChart   from '@/components/dashboard/StatusDonutChart'
import MonthlyBarChart    from '@/components/dashboard/MonthlyBarChart'
import CompletionProgress from '@/components/dashboard/CompletionProgress'
import RecentActivity     from '@/components/dashboard/RecentActivity'
import {
  FolderOpen, Plus, TrendingUp, CheckCircle,
  PauseCircle, Clock, Search, ChevronRight, Loader2,
} from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user }                             = useAuthStore()
  const { projects, loading, fetchProjects } = useProjectStore()
  const [search, setSearch]                  = useState('')

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user, fetchProjects])

  const total     = projects.length
  const active    = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  const onHold    = projects.filter(p => p.status === 'on_hold').length

  const thisMonth = projects.filter(p => {
    try {
      const d = new Date(p.createdAt as unknown as string | number | Date)
      const n = new Date()
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
    } catch { return false }
  }).length

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    return !q ||
      p.projectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
  }).slice(0, 6)

  const donutSegments = [
    { label: 'Active',    value: active,    color: '#16a34a' },
    { label: 'Completed', value: completed, color: '#2563eb' },
    { label: 'On hold',   value: onHold,    color: '#d97706' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {getGreeting()}, {user?.displayName ?? 'Engineer'}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary self-start sm:self-auto">
          <Plus size={16} /> New project
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner w-8 h-8" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total" value={total}
              icon={FolderOpen}  color="#2563eb" bg="#dbeafe"
              sub={thisMonth > 0 ? `+${thisMonth} this month` : undefined} />
            <StatCard label="Active"    value={active}    icon={TrendingUp}  color="#16a34a" bg="#dcfce7" />
            <StatCard label="Completed" value={completed} icon={CheckCircle} color="#2563eb" bg="#dbeafe" />
            <StatCard label="On hold"   value={onHold}    icon={PauseCircle} color="#d97706" bg="#fef3c7" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 flex flex-col items-center">
              <div className="section-title w-full mb-4">
                <FolderOpen size={14} className="text-brand-600" /> Status breakdown
              </div>
              <StatusDonutChart segments={donutSegments} total={total} size={160} />
            </div>
            <div className="card p-5 lg:col-span-2">
              <div className="section-title mb-4">
                <Clock size={14} className="text-brand-600" /> Monthly projects
              </div>
              <MonthlyBarChart projects={projects} />
            </div>
          </div>

          {/* Progress + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="section-title mb-4">
                <TrendingUp size={14} className="text-brand-600" /> Project progress
              </div>
              {total === 0 ? (
                <p className="text-text-muted text-sm text-center py-6">No projects yet</p>
              ) : (
                <div className="space-y-4">
                  <CompletionProgress label="Active"    value={active}    total={total} color="#16a34a" />
                  <CompletionProgress label="Completed" value={completed} total={total} color="#2563eb" />
                  <CompletionProgress label="On hold"   value={onHold}    total={total} color="#d97706" />
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Overall completion</span>
                    <span className="text-2xl font-bold text-text-primary">
                      {total > 0 ? Math.round((completed / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="section-title mb-4">
                <Clock size={14} className="text-brand-600" /> Recent activity
              </div>
              {user && <RecentActivity userId={user.uid} />}
            </div>
          </div>

          {/* Project list */}
          <div className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
                            px-5 py-3.5 border-b border-surface-border">
              <div className="section-title">
                <FolderOpen size={14} className="text-brand-600" /> Projects
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search..." className="input-field pl-8 py-2 text-xs w-40 sm:w-48" />
                </div>
                <Link href="/dashboard/projects"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap">
                  See all
                </Link>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <FolderOpen size={32} className="text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted text-sm">
                  {search ? 'No projects match your search' : 'No projects yet'}
                </p>
                {!search && (
                  <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm">
                    <Plus size={15} /> Create first project
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {filtered.map(p => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                    className="table-row group">
                    <div className={`w-0.5 h-9 rounded-full flex-shrink-0 ${
                      p.status === 'active'    ? 'bg-green-500' :
                      p.status === 'completed' ? 'bg-brand-500' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">
                        {p.projectName}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {p.clientName} · {p.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.status === 'active'    && <span className="badge-active">Active</span>}
                      {p.status === 'on_hold'   && <span className="badge-hold">On hold</span>}
                      {p.status === 'completed' && <span className="badge-done">Completed</span>}
                      <span className="text-xs text-text-muted hidden md:inline">
                        {formatDate(p.startDate)}
                      </span>
                      <ChevronRight size={14}
                        className="text-text-muted group-hover:text-text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
