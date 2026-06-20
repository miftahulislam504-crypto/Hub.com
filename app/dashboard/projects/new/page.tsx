'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { ArrowLeft, Save, Loader2, Building2, Calendar, FileText } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addProject } = useProjectStore()

  const [form, setForm] = useState({
    projectName:  '',
    clientName:   '',
    location:     '',
    startDate:    new Date().toISOString().split('T')[0],
    endDate:      '',
    description:  '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true); setError('')
    const project = await addProject(user.uid, {
      projectName:  form.projectName,
      clientName:   form.clientName,
      location:     form.location,
      startDate:    new Date(form.startDate),
      endDate:      form.endDate ? new Date(form.endDate) : undefined,
      description:  form.description || undefined,
    })
    setLoading(false)
    if (project) {
      router.replace(`/dashboard/projects/${project.id}`)
    } else {
      setError('Failed to create project. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/projects"
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">New project</h1>
          <p className="text-sm text-text-muted mt-0.5">Fill in the project details to get started</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Project info */}
        <div className="card p-5">
          <div className="section-title mb-4">
            <Building2 size={15} className="text-brand-600" /> Project details
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Project name <span className="text-red-500">*</span>
              </label>
              <input value={form.projectName} onChange={e => set('projectName', e.target.value)}
                placeholder="e.g. ABC Tower, 8-storey residential building"
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Client name <span className="text-red-500">*</span>
              </label>
              <input value={form.clientName} onChange={e => set('clientName', e.target.value)}
                placeholder="e.g. Mohammad Ali"
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Mirpur-10, Dhaka"
                required className="input-field" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card p-5">
          <div className="section-title mb-4">
            <Calendar size={15} className="text-brand-600" /> Timeline
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Start date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                End date <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <input type="date" value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="input-field" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-5">
          <div className="section-title mb-4">
            <FileText size={15} className="text-brand-600" /> Description
            <span className="ml-auto text-xs text-text-muted font-normal">{form.description.length}/500</span>
          </div>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Brief description of the project..."
            rows={3} maxLength={500}
            className="input-field resize-none" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/projects" className="btn-outline flex-1 justify-center">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {loading ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}
