// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore }    from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { getGreeting, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import StatCard           from '@/components/dashboard/StatCard'
import StatusDonutChart   from '@/components/dashboard/StatusDonutChart'
import MonthlyBarChart    from '@/components/dashboard/MonthlyBarChart'
import CompletionProgress from '@/components/dashboard/CompletionProgress'
import RecentActivity     from '@/components/dashboard/RecentActivity'
import {
  FolderOpen, Plus, TrendingUp, CheckCircle,
  PauseCircle, Clock, Search, ChevronRight, Loader2,
} from 'lucide-react'

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
    { label: 'চলমান',   value: active,    color: '#2E7D32' },
    { label: 'সম্পন্ন', value: completed, color: '#1565C0' },
    { label: 'বিরতি',   value: onHold,    color: '#F9A825' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {getGreeting()}, {user?.displayName ?? 'Engineer'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-BD', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary text-sm px-4 py-2.5 self-start sm:self-auto">
          <Plus size={18} /> নতুন প্রজেক্ট
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
            <StatCard label="মোট প্রজেক্ট" value={total}     icon={FolderOpen}  color="#1565C0" bg="#E3F2FD" sub={`এই মাসে ${thisMonth}টি নতুন`} />
            <StatCard label="চলমান"         value={active}    icon={TrendingUp}  color="#2E7D32" bg="#E8F5E9" />
            <StatCard label="সম্পন্ন"       value={completed} icon={CheckCircle} color="#1565C0" bg="#E8EAF6" />
            <StatCard label="বিরতিতে"       value={onHold}    icon={PauseCircle} color="#F57F17" bg="#FFF8E1" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 flex flex-col items-center">
              <h2 className="section-title w-full mb-4"><FolderOpen size={16} /> স্ট্যাটাস বিভাজন</h2>
              <StatusDonutChart segments={donutSegments} total={total} size={180} />
            </div>
            <div className="card p-5 lg:col-span-2">
              <h2 className="section-title mb-4"><Clock size={16} /> মাসিক প্রজেক্ট</h2>
              <MonthlyBarChart projects={projects} />
            </div>
          </div>

          {/* Progress + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="section-title mb-5"><TrendingUp size={16} /> প্রজেক্টের অগ্রগতি</h2>
              {total === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">কোনো প্রজেক্ট নেই</p>
              ) : (
                <div className="space-y-4">
                  <CompletionProgress label="চলমান"   value={active}    total={total} color="#2E7D32" />
                  <CompletionProgress label="সম্পন্ন" value={completed} total={total} color="#1565C0" />
                  <CompletionProgress label="বিরতি"   value={onHold}    total={total} color="#F9A825" />
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600">সামগ্রিক সম্পন্নতার হার</span>
                    <span className="text-2xl font-heading font-bold text-primary-900">
                      {total > 0 ? Math.round((completed / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="section-title mb-4"><Clock size={16} /> সাম্প্রতিক কার্যক্রম</h2>
              {user && <RecentActivity userId={user.uid} />}
            </div>
          </div>

          {/* Project Search + List */}
          <div className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
              <h2 className="section-title"><FolderOpen size={16} /> প্রজেক্ট তালিকা</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="খুঁজুন..." className="input-field pl-8 py-2 text-sm w-40 sm:w-48" />
                </div>
                <Link href="/dashboard/projects" className="text-sm text-primary-900 hover:underline font-medium whitespace-nowrap">
                  সব দেখুন →
                </Link>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {search ? 'কোনো প্রজেক্ট পাওয়া যায়নি' : 'কোনো প্রজেক্ট নেই'}
                </p>
                {!search && (
                  <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm px-4 py-2">
                    <Plus size={16} /> নতুন প্রজেক্ট
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
              { href: '/dashboard/projects/new', icon: '➕', label: 'নতুন প্রজেক্ট', disabled: false },
              { href: '/dashboard/projects',     icon: '📁', label: 'সব প্রজেক্ট',   disabled: false },
              { href: '#',                        icon: '📊', label: 'রিপোর্ট',        disabled: true  },
              { href: '#',                        icon: '🔗', label: 'Integration',     disabled: true  },
            ].map(item => (
              <Link key={item.label} href={item.href}
                className={`card p-4 flex flex-col items-center gap-2 text-center
                  hover:shadow-md transition-shadow
                  ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                {item.disabled && <span className="text-xs text-gray-400">শীঘ্রই</span>}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
