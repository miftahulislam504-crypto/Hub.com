'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import { Plus, Search, Loader2, FolderOpen, Trash2, ChevronRight } from 'lucide-react'
import { Project } from '@/lib/types'

const STATUS_FILTERS = [
  { value: '',           label: 'All'       },
  { value: 'active',     label: 'Active'    },
  { value: 'on_hold',    label: 'On hold'   },
  { value: 'completed',  label: 'Completed' },
]

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')    return <span className="badge-active">Active</span>
  if (status === 'on_hold')   return <span className="badge-hold">On hold</span>
  if (status === 'completed') return <span className="badge-done">Completed</span>
  return <span className="badge-hold">{status}</span>
}

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects, removeProject, changeStatus } = useProjectStore()
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('')
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
    if (!confirm(`Delete "${p.projectName}"? This cannot be undone.`)) return
    setDeleting(p.id)
    await removeProject(p.id)
    setDeleting(null)
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-muted mt-0.5">{projects.length} total</p>
        </div>
        <Link href="/dashboard/projects/new" className="btn-primary">
          <Plus size={16} /> New project
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="card p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, client, code..."
              className="input-field pl-9" />
          </div>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                  ${filter === f.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-text-secondary border-surface-border hover:border-brand-300'
                  }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner w-8 h-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <FolderOpen size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
          <p className="text-text-secondary font-medium text-sm">No projects found</p>
          {!search && !filter && (
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex mt-4 text-sm">
              <Plus size={15} /> Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_140px_100px_36px] gap-4
                          px-5 py-2.5 bg-surface border-b border-surface-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Project</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Client</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
            <span />
          </div>

          <div>
            {filtered.map(p => (
              <div key={p.id} className="table-row group">
                {/* Color bar */}
                <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${
                  p.status === 'active'    ? 'bg-green-500' :
                  p.status === 'completed' ? 'bg-brand-500' : 'bg-yellow-400'
                }`} />

                {/* Info */}
                <Link href={`/dashboard/projects/${p.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary text-sm truncate">
                      {p.projectName}
                    </span>
                    <span className="text-xs font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded hidden sm:inline">
                      {p.projectCode}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted truncate mt-0.5">
                    {p.location} · {formatDate(p.startDate)}
                  </div>
                </Link>

                {/* Client */}
                <div className="hidden sm:block text-sm text-text-secondary truncate w-[140px]">
                  {p.clientName}
                </div>

                {/* Status select */}
                <div className="flex-shrink-0">
                  <select
                    value={p.status}
                    onChange={e => changeStatus(p.id, e.target.value as Project['status'])}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer
                               focus:outline-none focus:ring-1 focus:ring-brand-500
                               bg-white border-surface-border text-text-secondary">
                    <option value="active">Active</option>
                    <option value="on_hold">On hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleDelete(p)} disabled={deleting === p.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
                               text-text-muted hover:text-red-500 hover:bg-red-50 transition-all">
                    {deleting === p.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                  <Link href={`/dashboard/projects/${p.id}`}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all">
                    <ChevronRight size={15} />
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
