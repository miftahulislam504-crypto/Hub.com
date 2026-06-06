// app/dashboard/projects/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProjectStore } from '@/store/useProjectStore'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { Project } from '@/lib/types'
import SiteInfoTab   from '@/components/site-info/SiteInfoTab'
import BNBCTab       from '@/components/bnbc/BNBCTab'
import BuildingTab   from '@/components/building/BuildingTab'
import DocumentsTab  from '@/components/documents/DocumentsTab'
import ActivityTab   from '@/components/activity/ActivityTab'
import {
  ArrowLeft, MapPin, User, Calendar, Hash,
  Layers, FileText, Building2, Trash2, Loader2, Edit2, Clock,
} from 'lucide-react'

const tabs = [
  { id: 'site',     label: 'সাইট',     icon: MapPin,     phase: 'Phase 3' },
  { id: 'bnbc',     label: 'BNBC',      icon: FileText,   phase: 'Phase 4' },
  { id: 'building', label: 'ভবন',       icon: Building2,  phase: 'Phase 5' },
  { id: 'docs',     label: 'ডকুমেন্ট', icon: Layers,     phase: 'Phase 7' },
  { id: 'activity', label: 'ইতিহাস',   icon: Clock,      phase: 'Phase 8' },
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { projects, loading, fetchProjects, changeStatus, removeProject } = useProjectStore()
  const [activeTab, setActiveTab] = useState('site')
  const [deleting, setDeleting]   = useState(false)

  const project = projects.find(p => p.id === id)

  useEffect(() => {
    if (!project && !loading) {
      // Try fetching if store is empty (direct URL access)
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        const user = useAuthStore.getState().user
        if (user) fetchProjects(user.uid)
      })
    }
  }, [project, loading, fetchProjects])

  const handleDelete = async () => {
    if (!project) return
    if (!confirm(`"${project.projectName}" সম্পূর্ণ ডিলিট করবেন?`)) return
    setDeleting(true)
    const ok = await removeProject(project.id)
    if (ok) router.replace('/dashboard/projects')
    else setDeleting(false)
  }

  if (loading && !project) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary-900" size={36} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">প্রজেক্ট পাওয়া যায়নি।</p>
        <Link href="/dashboard/projects" className="btn-primary inline-flex text-sm px-4 py-2">
          ← প্রজেক্ট তালিকায় ফিরুন
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm transition-colors">
        <ArrowLeft size={16} /> প্রজেক্ট তালিকা
      </Link>

      {/* Hero card */}
      <div className="bg-primary-900 rounded-2xl text-white p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Code + Status */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-white/15 text-xs px-2 py-1 rounded-lg font-mono">
                {project.projectCode}
              </span>
              <select
                value={project.status}
                onChange={e => changeStatus(project.id, e.target.value as Project['status'])}
                className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer
                  focus:outline-none ${getStatusColor(project.status)}`}>
                <option value="active">চলমান</option>
                <option value="on_hold">বিরতি</option>
                <option value="completed">সম্পন্ন</option>
              </select>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-heading font-bold mb-3 leading-tight">
              {project.projectName}
            </h1>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-blue-200 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} /> {project.clientName}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {project.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} /> {formatDate(project.startDate)}
                {project.endDate && ` — ${formatDate(project.endDate)}`}
              </div>
              {project.description && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Hash size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{project.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit + Integration + Delete buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Link href={`/dashboard/projects/${project.id}/edit`}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-2.5 transition-all"
              title="সম্পাদনা">
              <Edit2 size={18} />
            </Link>
            <Link href={`/dashboard/projects/${project.id}/integration`}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl p-2.5 transition-all"
              title="Integration Export">
              <span className="text-base leading-none">🔗</span>
            </Link>
            <button onClick={handleDelete} disabled={deleting}
              className="bg-white/10 hover:bg-red-500/80 text-white rounded-xl p-2.5 transition-all">
              {deleting
                ? <Loader2 size={18} className="animate-spin" />
                : <Trash2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-primary-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
              }`}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — coming soon placeholders */}
      {/* Site Info — Phase 2 ✅ */}
      {activeTab === 'site' && (
        <SiteInfoTab projectId={project.id} />
      )}

      {/* BNBC — Phase 3 ✅ */}
      {activeTab === 'bnbc' && (
        <BNBCTab projectId={project.id} />
      )}

      {/* Building — Phase 5 ✅ */}
      {activeTab === 'building' && (
        <BuildingTab projectId={project.id} />
      )}

      {/* Documents — Phase 7 ✅ */}
      {activeTab === 'docs' && (
        <DocumentsTab projectId={project.id} />
      )}

      {/* Activity — Phase 8 ✅ */}
      {activeTab === 'activity' && (
        <ActivityTab projectId={project.id} />
      )}
    </div>
  )
}
