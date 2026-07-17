// components/integration/ExportCenterCard.tsx
'use client'
import { useState } from 'react'
import { Project } from '@/lib/types'
import { HubExportPayload } from '@/lib/types/integration.types'
import { downloadJSON, downloadBlob, downloadCSV } from '@/lib/services/integration.service'
import { generateProjectPDF } from '@/lib/export/pdf-export'
import { generateEventsCSV } from '@/lib/export/csv-export'
import { generateProjectPackage } from '@/lib/export/zip-export'
import { hub } from '@/lib/hub-sdk'
import { Download, Eye, FileText, FileSpreadsheet, Package, Loader2 } from 'lucide-react'

interface Props {
  project: Project
  payload: HubExportPayload
  onPreview: () => void
}

// প্ল্যানের section 11 checkbox list — শুধু "Project Information" আর
// "Reports"-এর real data আছে এখন, বাকিগুলো honestly disabled দেখায়।
const CATEGORIES: { key: string; label: string; hasData: boolean }[] = [
  { key: 'project',      label: 'Project Information', hasData: true },
  { key: 'architectural', label: 'Architectural',        hasData: false },
  { key: 'structural',   label: 'Structural',            hasData: false },
  { key: 'boq',          label: 'BOQ',                   hasData: false },
  { key: 'estimate',     label: 'Cost Estimate',         hasData: false },
  { key: 'schedule',     label: 'Project Schedule',      hasData: false },
  { key: 'progress',     label: 'Progress',              hasData: false },
]

export default function ExportCenterCard({ project, payload, onPreview }: Props) {
  const [busy, setBusy] = useState<'pdf' | 'csv' | 'zip' | null>(null)
  const [lastExport, setLastExport] = useState<string | null>(null)

  function markDone() {
    setLastExport(new Date().toLocaleTimeString('en-BD'))
  }

  function handleJSON() {
    downloadJSON(payload, `civilos-hub_${payload.projectCode}_full_${Date.now()}.json`)
    markDone()
  }

  async function handlePDF() {
    setBusy('pdf')
    try {
      // ফ্রেশ reports নিয়ে PDF বানানো হয় — আগে generate করা থাকলেও এখন
      // আবার regenerate করে সর্বশেষ ডেটা নিশ্চিত করা হয় (Phase 7 পুনঃব্যবহার)
      const [siteReport, bnbcReport, buildingReport] = await Promise.all([
        hub.generateSiteInfoSummary(project.id),
        hub.generateBnbcParametersReport(project.id),
        hub.generateBuildingInfoSummary(project.id),
      ])
      const reports = [siteReport, bnbcReport, buildingReport].filter((r): r is NonNullable<typeof r> => !!r)
      const blob = generateProjectPDF(project, reports)
      downloadBlob(blob, `${project.projectCode}_summary.pdf`)
      markDone()
    } finally {
      setBusy(null)
    }
  }

  async function handleCSV() {
    setBusy('csv')
    try {
      const events = await hub.getEvents(project.id, 200)
      const csv = generateEventsCSV(events)
      downloadCSV(csv, `${project.projectCode}_activity-log.csv`)
      markDone()
    } finally {
      setBusy(null)
    }
  }

  async function handleCompletePackage() {
    setBusy('zip')
    try {
      const reports = await hub.getProjectReports(project.id)
      const blob = await generateProjectPackage(project, payload, reports)
      downloadBlob(blob, `${project.projectCode}_complete-package.zip`)
      markDone()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="card p-5">
      <h3 className="section-title mb-3">📦 Export Center</h3>

      {/* Checkbox-style category indicator — প্ল্যান section 11 অনুযায়ী */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <label key={cat.key}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg
              ${cat.hasData ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-300'}`}>
            <input type="checkbox" checked={cat.hasData} disabled readOnly className="accent-green-600" />
            {cat.label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={handleJSON} className="btn-primary text-sm">
          <Download size={16} /> JSON
        </button>
        <button onClick={handlePDF} disabled={!!busy} className="btn-outline text-sm disabled:opacity-40">
          {busy === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} PDF
        </button>
        <button onClick={handleCSV} disabled={!!busy} className="btn-outline text-sm disabled:opacity-40">
          {busy === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} CSV
        </button>
        <button onClick={handleCompletePackage} disabled={!!busy} className="btn-outline text-sm disabled:opacity-40">
          {busy === 'zip' ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />} Complete Package
        </button>
      </div>

      <button onClick={onPreview} className="text-xs text-gray-400 hover:text-gray-600 mt-3 flex items-center gap-1">
        <Eye size={13} /> JSON Preview
      </button>

      <p className="text-[11px] text-gray-400 mt-2">
        PDF-এ Project Information + generate করা Reports থাকে। CSV-এ Activity
        Log থাকে। Complete Package-এ সবকিছু ফোল্ডার-ভাগ করে থাকে
        (Architectural/Structural/Estimate/Management ফোল্ডার এখনো খালি —
        সেই App গুলো যুক্ত না হওয়া পর্যন্ত)।
      </p>

      {lastExport && (
        <p className="text-xs text-green-600 mt-2 text-center">
          ✓ সর্বশেষ export: {lastExport}
        </p>
      )}
    </div>
  )
}
