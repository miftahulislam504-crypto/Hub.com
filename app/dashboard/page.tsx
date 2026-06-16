// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore }    from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useLang }         from '@/components/providers/LanguageProvider'
import { getGreeting, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import StatCard           from '@/components/dashboard/StatCard'
import StatusDonutChart   from '@/components/dashboard/StatusDonutChart'
import MonthlyBarChart    from '@/components/dashboard/MonthlyBarChart'
import CompletionProgress from '@/components/dashboard/CompletionProgress'
import RecentActivity     from '@/components/dashboard/RecentActivity'
import {
  FolderOpen, Plus, TrendingUp, CheckCircle,
  PauseCircle, Clock, Search, ChevronRight, Loader2,
  BarChart2, Link2,
} from 'lucide-react'

export default function DashboardPage() {
  const { user }                             = useAuthStore()
  const { projects, loading, fetchProjects } = useProjectStore()
  const { t, lang }                          = useLang()
  const [search, setSearch]                  = useState('')

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user, fetchProjects])

  const total     = projects.length
  const active    = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  const onHold    = projects.filter(p => p.status === 'on_hold').length

  const thisMonth = projects.filter(p => {
    const d = new Date(p.createdAt), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).length

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    return !q ||
      p.projectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
  }).slice(0, 6)

  const donutSegments = [
    { label: t('activeLabel'),    value: active,    color: '#2E7D32' },
    { label: t('completedLabel'), value: completed, color: '#1565C0' },
    { label: t('onHoldLabel'),    value: onHold,    color: '#F9A825' },
  ]

  const dateLocale = lang === 'bn' ? 'en-BD' : 'en-US'

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {getGreeting()}, {user?.displayName ?? t('engineer')} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString(dateLocale, {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary text-sm px-4 py-2.5 self-start sm:self-auto">
          <Plus size={18} /> {t('newProject')}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-900" size={36} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t('totalProjects')} value={total}     icon={FolderOpen}  color="#1565C0" bg="#E3F2FD"
              sub={t('thisMonthNew', { n: thisMonth })} />
            <StatCard label={t('active')}        value={active}    icon={TrendingUp}  color="#2E7D32" bg="#E8F5E9" />
            <StatCard label={t('completed')}     value={completed} icon={CheckCircle} color="#1565C0" bg="#E8EAF6" />
            <StatCard label={t('onHold')}        value={onHold}    icon={PauseCircle} color="#F57F17" bg="#FFF8E1" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 flex flex-col items-center">
              <h2 className="section-title w-full mb-4"><FolderOpen size={16} /> {t('statusBreakdown')}</h2>
              <StatusDonutChart segments={donutSegments} total={total} size={180} />
            </div>
            <div className="card p-5 lg:col-span-2">
              <h2 className="section-title mb-4"><Clock size={16} /> {t('monthlyProjects')}</h2>
              <MonthlyBarChart projects={projects} />
            </div>
          </div>

          {/* Progress + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="section-title mb-5"><TrendingUp size={16} /> {t('projectProgress')}</h2>
              {total === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">{t('noProjects')}</p>
              ) : (
                <div className="space-y-4">
                  <CompletionProgress label={t('activeLabel')}    value={active}    total={total} color="#2E7D32" />
                  <CompletionProgress label={t('completedLabel')} value={completed} total={total} color="#1565C0" />
                  <CompletionProgress label={t('onHoldLabel')}    value={onHold}    total={total} color="#F9A825" />
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('overallCompletion')}</span>
                    <span className="text-2xl font-heading font-bold text-primary-900">
                      {total > 0 ? Math.round((completed / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="section-title mb-4"><Clock size={16} /> {t('recentActivity')}</h2>
              {user && <RecentActivity userId={user.uid} />}
            </div>
          </div>

          {/* Project Search + List */}
          <div className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
              <h2 className="section-title"><FolderOpen size={16} /> {t('projectList')}</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t('search')} className="input-field pl-8 py-2 text-sm w-40 sm:w-48" />
                </div>
                <Link href="/dashboard/projects" className="text-sm text-primary-900 hover:underline font-medium whitespace-nowrap">
                  {t('seeAll')}
                </Link>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {search ? t('noProjectsFound') : t('noProjects')}
                </p>
                {!search && (
                  <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm px-4 py-2">
                    <Plus size={16} /> {t('newProject')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                      p.status === 'active' ? 'bg-green-500' :
                      p.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-sm">{p.projectName}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{p.clientName} · {p.location}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border hidden sm:inline ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                      <span className="text-xs text-gray-400 hidden md:inline">{formatDate(p.startDate)}</span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/dashboard/projects/new', Icon: Plus,      labelKey: 'quickNewProject'  as const, disabled: false },
              { href: '/dashboard/projects',     Icon: FolderOpen,labelKey: 'quickAllProjects' as const, disabled: false },
              { href: '#',                       Icon: BarChart2, labelKey: 'quickReports'     as const, disabled: true  },
              { href: '#',                       Icon: Link2,     labelKey: 'quickIntegration' as const, disabled: true  },
            ].map(item => (
              <Link key={item.labelKey} href={item.href}
                className={`card p-4 flex flex-col items-center gap-2 text-center
                  hover:shadow-md transition-shadow
                  ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <item.Icon size={22} className="text-primary-900" />
                <span className="text-xs font-semibold text-gray-700">{t(item.labelKey)}</span>
                {item.disabled && <span className="text-xs text-gray-400">{t('comingSoon')}</span>}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
