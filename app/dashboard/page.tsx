// app/dashboard/page.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { getGreeting, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { FolderOpen, Plus, TrendingUp, CheckCircle, PauseCircle, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects } = useProjectStore()

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user, fetchProjects])

  const total     = projects.length
  const active    = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  const onHold    = projects.filter(p => p.status === 'on_hold').length
  const recent    = projects.slice(0, 5)

  const stats = [
    { label: 'মোট প্রজেক্ট', value: total,     icon: FolderOpen,    color: 'text-primary-900 bg-blue-50'  },
    { label: 'চলমান',         value: active,    icon: TrendingUp,    color: 'text-green-700 bg-green-50'   },
    { label: 'সম্পন্ন',       value: completed, icon: CheckCircle,   color: 'text-blue-700 bg-blue-50'     },
    { label: 'বিরতি',         value: onHold,    icon: PauseCircle,   color: 'text-yellow-700 bg-yellow-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          {getGreeting()}, {user?.displayName ?? 'Engineer'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary-900" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div className="text-3xl font-heading font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href="/dashboard/projects/new"
              className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="bg-accent-500 text-white rounded-xl w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus size={22} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">নতুন প্রজেক্ট</div>
                <div className="text-xs text-gray-500">তৈরি করুন</div>
              </div>
            </Link>
            <Link href="/dashboard/projects"
              className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group">
              <div className="bg-primary-900 text-white rounded-xl w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen size={22} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">সব প্রজেক্ট</div>
                <div className="text-xs text-gray-500">দেখুন</div>
              </div>
            </Link>
          </div>

          {/* Recent projects */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="section-title">
                <FolderOpen size={18} /> সাম্প্রতিক প্রজেক্ট
              </h2>
              <Link href="/dashboard/projects"
                className="text-sm text-primary-900 hover:underline font-medium">
                সব দেখুন →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="py-16 text-center">
                <FolderOpen size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">কোনো প্রজেক্ট নেই।</p>
                <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm px-4 py-2">
                  <Plus size={16} /> নতুন প্রজেক্ট
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map(p => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${
                      p.status === 'active' ? 'bg-green-500' :
                      p.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p.projectName}</div>
                      <div className="text-sm text-gray-500 truncate">{p.clientName} · {p.location}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${getStatusColor(p.status)}`}>
                        {getStatusLabel(p.status)}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(p.startDate)}</div>
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
