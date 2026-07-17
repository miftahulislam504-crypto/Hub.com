// components/integration/DependencyStatusCard.tsx
'use client'
import { useEffect, useState } from 'react'
import { hub } from '@/lib/hub-sdk'
import { DependencyWithStatus } from '@/lib/firestore/dependency.firestore'
import { MODULE_LABELS } from '@/lib/types/dependency.types'
import { CheckCircle, AlertTriangle, Loader2, GitBranch } from 'lucide-react'

interface Props {
  projectId: string
}

export default function DependencyStatusCard({ projectId }: Props) {
  const [dependencies, setDependencies] = useState<DependencyWithStatus[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    hub.getProjectDependencyStatuses(projectId).then(deps => {
      if (!cancelled) {
        setDependencies(deps)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [projectId])

  const outdatedCount = dependencies.filter(d => d.status === 'OUTDATED').length

  if (loading) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={20} />
      </div>
    )
  }

  if (dependencies.length === 0) {
    return (
      <div className="card p-5 flex items-center gap-3 text-sm text-gray-400">
        <GitBranch size={18} className="flex-shrink-0" />
        এখনো কোনো module dependency track হয়নি
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="section-title flex items-center gap-2">
          <GitBranch size={16} /> Module Dependencies
        </h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full
          ${outdatedCount === 0
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
          }`}>
          {outdatedCount === 0 ? 'সব হালনাগাদ' : `${outdatedCount} টি পুরনো`}
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {dependencies.map(dep => (
          <div key={dep.id} className="flex items-center gap-3 px-5 py-3.5">
            {dep.status === 'CURRENT'
              ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              : <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
            }

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {MODULE_LABELS[dep.dependentModule] ?? dep.dependentModule}
                <span className="text-gray-400 font-normal mx-1.5">নির্ভর করে</span>
                {MODULE_LABELS[dep.upstreamModule] ?? dep.upstreamModule}
                <span className="text-gray-400 font-normal">-এর ওপর</span>
              </p>
              <p className={`text-xs mt-0.5 ${dep.status === 'OUTDATED' ? 'text-amber-600' : 'text-gray-500'}`}>
                {dep.reason} · v{dep.upstreamVersionAtLink} link হয়েছিল, বর্তমানে v{dep.upstreamCurrentVersion}
                {dep.status === 'OUTDATED' && ' — উৎস পাল্টেছে, আবার review করুন'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
