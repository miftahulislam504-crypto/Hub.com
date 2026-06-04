// app/dashboard/projects/[id]/edit/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProjectStore } from '@/store/useProjectStore'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function EditProjectPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const { projects, fetchProjects, editProject } = useProjectStore()

  const project = projects.find(p => p.id === id)

  const [form, setForm] = useState({
    projectName: '',
    clientName:  '',
    location:    '',
    startDate:   '',
    endDate:     '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Populate form when project loads
  useEffect(() => {
    if (project) {
      setForm({
        projectName: project.projectName,
        clientName:  project.clientName,
        location:    project.location,
        startDate:   project.startDate.toISOString().split('T')[0],
        endDate:     project.endDate ? project.endDate.toISOString().split('T')[0] : '',
        description: project.description ?? '',
      })
    }
  }, [project])

  // Fetch if store empty (direct URL)
  useEffect(() => {
    if (!project) {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        const user = useAuthStore.getState().user
        if (user) fetchProjects(user.uid)
      })
    }
  }, [project, fetchProjects])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const ok = await editProject(id, {
      projectName: form.projectName,
      clientName:  form.clientName,
      location:    form.location,
      startDate:   new Date(form.startDate),
      endDate:     form.endDate ? new Date(form.endDate) : undefined,
      description: form.description || undefined,
    })

    setLoading(false)
    if (ok) {
      router.replace(`/dashboard/projects/${id}`)
    } else {
      setError('আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    }
  }

  if (!project) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary-900" size={36} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/projects/${id}`}
          className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">প্রজেক্ট সম্পাদনা</h1>
          <p className="text-gray-500 text-sm">{project.projectCode}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project info */}
        <div className="card p-6">
          <h2 className="section-title mb-5">📋 প্রজেক্টের তথ্য</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                প্রজেক্টের নাম <span className="text-red-500">*</span>
              </label>
              <input value={form.projectName}
                onChange={e => set('projectName', e.target.value)}
                placeholder="প্রজেক্টের নাম"
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ক্লায়েন্টের নাম <span className="text-red-500">*</span>
              </label>
              <input value={form.clientName}
                onChange={e => set('clientName', e.target.value)}
                placeholder="ক্লায়েন্টের নাম"
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                অবস্থান <span className="text-red-500">*</span>
              </label>
              <input value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="যেমন: মিরপুর-১০, ঢাকা"
                required className="input-field" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card p-6">
          <h2 className="section-title mb-5">📅 সময়কাল</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                শুরুর তারিখ <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                শেষ তারিখ <span className="text-gray-400">(ঐচ্ছিক)</span>
              </label>
              <input type="date" value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="input-field" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6">
          <h2 className="section-title mb-5">📝 বিবরণ</h2>
          <textarea value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="প্রজেক্ট সম্পর্কে সংক্ষিপ্ত বিবরণ..."
            rows={4} maxLength={500}
            className="input-field resize-none" />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.description.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/dashboard/projects/${id}`} className="btn-outline flex-1">
            বাতিল
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
          </button>
        </div>
      </form>
    </div>
  )
}
