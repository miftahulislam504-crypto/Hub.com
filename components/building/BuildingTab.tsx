// components/building/BuildingTab.tsx
'use client'
import { useEffect, useState } from 'react'
import { useBuildingStore } from '@/store/useBuildingStore'
import { BuildingFormData } from '@/lib/types/building.types'
import BuildingForm    from './BuildingForm'
import BuildingSummary from './BuildingSummary'
import { Building2, Loader2 } from 'lucide-react'

interface Props { projectId: string }

export default function BuildingTab({ projectId }: Props) {
  const { data, loading, saving, fetch, save } = useBuildingStore()
  const [editing, setEditing] = useState(false)

  const info      = data[projectId]
  const isLoading = loading[projectId]

  useEffect(() => { fetch(projectId) }, [projectId, fetch])

  const handleSave = async (form: BuildingFormData) => {
    const ok = await save(projectId, form)
    if (ok) setEditing(false)
    return ok
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-primary-900" size={32} />
      </div>
    )
  }

  if (editing || !info) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-primary-900" /> ভবনের তথ্য
          </h2>
          {!info && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
              এখনো পূরণ হয়নি
            </span>
          )}
        </div>
        <BuildingForm
          initial={info}
          onSave={handleSave}
          onCancel={() => info ? setEditing(false) : null}
          saving={saving}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <Building2 size={20} className="text-primary-900" /> ভবনের তথ্য
        </h2>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
          ✓ সংরক্ষিত
        </span>
      </div>
      <BuildingSummary info={info} onEdit={() => setEditing(true)} />
    </div>
  )
}
