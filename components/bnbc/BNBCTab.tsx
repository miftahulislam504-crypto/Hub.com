// components/bnbc/BNBCTab.tsx
'use client'
import { useEffect, useState } from 'react'
import { useBNBCStore }     from '@/store/useBNBCStore'
import { useSiteInfoStore } from '@/store/useSiteInfoStore'
import { BNBCFormData }     from '@/lib/types/bnbc.types'
import BNBCForm    from './BNBCForm'
import BNBCSummary from './BNBCSummary'
import { FileText, Loader2 } from 'lucide-react'

interface Props { projectId: string }

export default function BNBCTab({ projectId }: Props) {
  const { data: bnbcData, loading, saving, fetch, save } = useBNBCStore()
  const { data: siteData, fetch: fetchSite } = useSiteInfoStore()
  const [editing, setEditing] = useState(false)

  const bnbc     = bnbcData[projectId]
  const siteInfo = siteData[projectId]
  const isLoading = loading[projectId]

  useEffect(() => {
    fetch(projectId)
    fetchSite(projectId)   // need soil type
  }, [projectId, fetch, fetchSite])

  const handleSave = async (form: BNBCFormData) => {
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

  if (editing || !bnbc) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-primary-900" /> BNBC 2020 সেটিংস
          </h2>
          {!bnbc && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium">
              এখনো পূরণ হয়নি
            </span>
          )}
        </div>
        <BNBCForm
          initial={bnbc}
          linkedSoilType={siteInfo?.soilType}
          onSave={handleSave}
          onCancel={() => bnbc ? setEditing(false) : null}
          saving={saving}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <FileText size={20} className="text-primary-900" /> BNBC 2020 সেটিংস
        </h2>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
          ✓ সংরক্ষিত
        </span>
      </div>
      <BNBCSummary info={bnbc} onEdit={() => setEditing(true)} />
    </div>
  )
}
