// components/site-info/SiteInfoTab.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSiteInfoStore } from '@/store/useSiteInfoStore'
import { SiteInfoFormData } from '@/lib/types/site-info.types'
import SiteInfoForm    from './SiteInfoForm'
import SiteInfoSummary from './SiteInfoSummary'
import { MapPin, Plus, Loader2 } from 'lucide-react'

interface Props { projectId: string }

export default function SiteInfoTab({ projectId }: Props) {
  const { data, loading, saving, fetch, save } = useSiteInfoStore()
  const [editing, setEditing] = useState(false)

  const siteInfo = data[projectId]
  const isLoading = loading[projectId]

  useEffect(() => { fetch(projectId) }, [projectId, fetch])

  const handleSave = async (form: SiteInfoFormData) => {
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

  // Show form if editing OR no data yet
  if (editing || !siteInfo) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-primary-900" />
            সাইট ইনফরমেশন
          </h2>
          {!siteInfo && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
              এখনো পূরণ হয়নি
            </span>
          )}
        </div>

        <SiteInfoForm
          projectId={projectId}
          initial={siteInfo}
          onSave={handleSave}
          onCancel={() => siteInfo ? setEditing(false) : null}
          saving={saving}
        />
      </div>
    )
  }

  // Show summary
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={20} className="text-primary-900" />
          সাইট ইনফরমেশন
        </h2>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
          ✓ সংরক্ষিত
        </span>
      </div>
      <SiteInfoSummary info={siteInfo} onEdit={() => setEditing(true)} />
    </div>
  )
}
