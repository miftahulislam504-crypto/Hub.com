// app/dashboard/projects/[id]/integration/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams }           from 'next/navigation'
import Link                    from 'next/link'
import { useProjectStore }     from '@/store/useProjectStore'
import { useAuthStore }        from '@/store/useAuthStore'
import { buildExportPayload } from '@/lib/services/integration.service'
import {
  HubExportPayload,
  TARGET_APPS,
} from '@/lib/types/integration.types'
import DataReadinessCard from '@/components/integration/DataReadinessCard'
import DependencyStatusCard from '@/components/integration/DependencyStatusCard'
import ApprovalCard from '@/components/integration/ApprovalCard'
import WorkflowProgressCard from '@/components/integration/WorkflowProgressCard'
import EcosystemAppsCard from '@/components/integration/EcosystemAppsCard'
import ActivityFeedCard from '@/components/integration/ActivityFeedCard'
import ReportsCenterCard from '@/components/integration/ReportsCenterCard'
import ExportCenterCard  from '@/components/integration/ExportCenterCard'
import AppExportCard     from '@/components/integration/AppExportCard'
import JsonPreviewModal  from '@/components/integration/JsonPreviewModal'
import {
  ArrowLeft, Loader2, RefreshCw,
} from 'lucide-react'

export default function IntegrationPage() {
  const { id }                           = useParams<{ id: string }>()
  const { user }                         = useAuthStore()
  const { projects, fetchProjects }      = useProjectStore()
  const [payload,   setPayload]          = useState<HubExportPayload | null>(null)
  const [loading,   setLoading]          = useState(true)
  const [showPreview, setShowPreview]    = useState(false)

  const project = projects.find(p => p.id === id)

  useEffect(() => {
    if (user && !projects.length) fetchProjects(user.uid)
  }, [user, projects.length, fetchProjects])

  const loadPayload = async () => {
    setLoading(true)
    const data = await buildExportPayload(id)
    setPayload(data)
    setLoading(false)
  }

  useEffect(() => { loadPayload() }, [id])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/projects/${id}`}
          className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            🔗 Integration Bridge
          </h1>
          <p className="text-gray-500 text-sm truncate">
            {project?.projectName ?? id} — অন্য App এ data export
          </p>
        </div>
        <button onClick={loadPayload}
          className="p-2 text-gray-400 hover:text-primary-900 hover:bg-primary-50
            rounded-xl transition-all" title="রিফ্রেশ">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-900" size={36} />
        </div>
      ) : !payload ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">ডেটা লোড করতে সমস্যা হয়েছে।</p>
          <button onClick={loadPayload} className="btn-primary mt-4 inline-flex text-sm px-4 py-2">
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Overall workflow stage + app signals — Phase 4 (Workflow Engine) */}
          <WorkflowProgressCard projectId={id} />

          {/* Data readiness */}
          <DataReadinessCard payload={payload} projectId={id} />

          {/* Module dependency status — Phase 2 (Version Dependency System) */}
          <DependencyStatusCard projectId={id} />

          {/* Approve / Review / Reject per module — Phase 3 (Approval System) */}
          <ApprovalCard projectId={id} user={user} />

          {/* Report registry — Phase 7 (Report Center) */}
          <ReportsCenterCard projectId={id} user={user} />

          {/* Live ecosystem status — replaces the old "future" promise for Structural */}
          <EcosystemAppsCard projectId={id} />

          {/* Live event log — Phase 5 (Event Service) */}
          <ActivityFeedCard projectId={id} />

          {/* Export Center — Phase 8 */}
          {project ? (
            <ExportCenterCard project={project} payload={payload} onPreview={() => setShowPreview(true)} />
          ) : (
            <div className="card p-5 flex items-center justify-center text-sm text-gray-400">
              <Loader2 className="animate-spin mr-2" size={16} /> প্রজেক্ট তথ্য লোড হচ্ছে...
            </div>
          )}

          {/* Per-app export */}
          <div>
            <h3 className="section-title mb-4">🎯 App-নির্দিষ্ট Export</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TARGET_APPS.map(app => (
                <AppExportCard key={app.id} app={app} payload={payload} />
              ))}
            </div>
          </div>

          {/* Integration guide */}
          <div className="card p-5">
            <h3 className="section-title mb-4">📖 কীভাবে ব্যবহার করবেন</h3>
            <div className="space-y-3">
              {[
                { step: '১', text: 'উপরে ডেটার অবস্থা দেখুন — সব ৩টি সম্পূর্ণ হলে সেরা ফলাফল পাবেন' },
                { step: '২', text: 'কোন App এ data নিতে চান সেটা বেছে নিন' },
                { step: '৩', text: '"JSON Download" চাপুন — ফাইলটা সেভ হবে' },
                { step: '৪', text: 'সেই App এ গিয়ে "Import from Hub" অপশনে ফাইলটা দিন' },
                { step: '৫', text: 'স্বয়ংক্রিয়ভাবে সব ডেটা পূরণ হয়ে যাবে' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary-900 text-white
                    flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.step}
                  </span>
                  <p className="text-sm text-gray-700 pt-1">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              💡 Structural App এখন shared Firestore-এর মাধ্যমে সরাসরি sync হয় — উপরে "🌐 Ecosystem App Status" থেকে খুললেই Hub-এর Site Info/BNBC/Building তথ্য দিয়ে স্বয়ংক্রিয়ভাবে শুরু হয়ে যাবে, কোনো manual import লাগবে না। বাকি App গুলো (Architectural, Estimating, PM, Reports) এখনো এই manual JSON export-এর উপর নির্ভরশীল — সেগুলো ধাপে ধাপে একই Direct-sync মডেলে আনা হচ্ছে।
            </div>
          </div>
        </div>
      )}

      {/* JSON Preview Modal */}
      {showPreview && payload && (
        <JsonPreviewModal payload={payload} onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}
