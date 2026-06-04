// app/dashboard/projects/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { Plus, Search, Loader2, FolderOpen, Trash2, ChevronRight } from 'lucide-react'
import { Project } from '@/lib/types'

const filters = [
  { value: '',           label: 'সব' },
  { value: 'active',    label: 'চলমান' },
  { value: 'on_hold',   label: 'বিরতি' },
  { value: 'completed', label: 'সম্পন্ন' },
]

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects, removeProject, changeStatus } = useProjectStore()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchProjects(user.uid)
  }, [user, fetchProjects])

  const filtered = projects.filter(p => {
    const matchFilter = !filter || p.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.projectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.projectCode.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const handleDelete = async (p: Project) => {
    if (!confirm(`"${p.projectName}" ডিলিট করবেন? সব ডেটা মুছে যাবে।`)) return
    setDeleting(p.id)
    await removeProject(p.id)
    setDeleting(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">প্রজেক্টসমূহ</h1>
          <p className="text-gray-500 text-sm">{projects.length}টি প্রজেক্ট</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary text-sm px-4 py-2.5">
          <Plus size={18} /> নতুন প্রজেক্ট
        </Link>
      </div>

      {/* Search + filter */}
      <div className="card p-4 mb-6">
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="প্রজেক্ট খুঁজুন..."
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                ${filter === f.value
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-900'
                }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-900" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">কোনো প্রজেক্ট পাওয়া যায়নি।</p>
          {!search && !filter && (
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm px-4 py-2">
              <Plus size={16} /> নতুন প্রজেক্ট তৈরি করুন
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                {/* Status bar */}
                <div className={`w-1 h-14 rounded-full flex-shrink-0 ${
                  p.status === 'active' ? 'bg-green-500' :
                  p.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />

                {/* Info */}
                <Link href={`/dashboard/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{p.projectName}</div>
                  <div className="text-sm text-gray-500 truncate">{p.clientName} · {p.location}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.projectCode} · {formatDate(p.startDate)}</div>
                </Link>

                {/* Status badge */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <select
                    value={p.status}
                    onChange={e => changeStatus(p.id, e.target.value as Project['status'])}
                    className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer
                      focus:outline-none ${getStatusColor(p.status)}`}>
                    <option value="active">চলমান</option>
                    <option value="on_hold">বিরতি</option>
                    <option value="completed">সম্পন্ন</option>
                  </select>

                  <button onClick={() => handleDelete(p)} disabled={deleting === p.id}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1">
                    {deleting === p.id
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Trash2 size={16} />}
                  </button>

                  <Link href={`/dashboard/projects/${p.id}`} className="text-gray-400">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
