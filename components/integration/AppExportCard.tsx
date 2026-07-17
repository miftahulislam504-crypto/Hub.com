// components/integration/AppExportCard.tsx
'use client'
import { useState } from 'react'
import { HubExportPayload, TARGET_APPS } from '@/lib/types/integration.types'
import { downloadJSON, copyToClipboard }  from '@/lib/services/integration.service'
import { Download, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  app:     typeof TARGET_APPS[number]
  payload: HubExportPayload
}

export default function AppExportCard({ app, payload }: Props) {
  const [copying,    setCopying]    = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Check if this app has all required data
  const missingData = app.needs.filter(need => {
    if (need === 'siteInfo')     return !payload.siteInfo
    if (need === 'bnbcSettings') return !payload.bnbcSettings
    if (need === 'buildingInfo') return !payload.buildingInfo
    return false
  })

  const isReady = missingData.length === 0

  // Build filtered payload for this app
  const buildAppPayload = (): HubExportPayload => {
    const filtered: HubExportPayload = {
      version:     payload.version,
      contractSchemaVersion: payload.contractSchemaVersion,
      exportedAt:  new Date().toISOString(),
      projectId:   payload.projectId,
      projectCode: payload.projectCode,
      projectName: payload.projectName,
    }
    if (app.needs.includes('siteInfo' as never)     && payload.siteInfo)
      filtered.siteInfo     = payload.siteInfo
    if (app.needs.includes('bnbcSettings' as never) && payload.bnbcSettings)
      filtered.bnbcSettings = payload.bnbcSettings
    if (app.needs.includes('buildingInfo' as never) && payload.buildingInfo)
      filtered.buildingInfo = payload.buildingInfo
    // Reports gets everything
    if (app.id === 'reports' || app.id === 'projectmgmt') {
      filtered.siteInfo     = payload.siteInfo
      filtered.bnbcSettings = payload.bnbcSettings
      filtered.buildingInfo = payload.buildingInfo
    }
    return filtered
  }

  const handleDownload = () => {
    setDownloading(true)
    const appPayload = buildAppPayload()
    const filename   = `civilos-hub_${payload.projectCode}_${app.id}_${Date.now()}.json`
    downloadJSON(appPayload, filename)
    setTimeout(() => setDownloading(false), 800)
  }

  const handleCopy = async () => {
    setCopying(true)
    const appPayload = buildAppPayload()
    const ok = await copyToClipboard(appPayload)
    setCopying(false)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className={`card overflow-hidden transition-all
      ${isReady ? 'hover:shadow-md' : 'opacity-75'}`}>

      {/* Header */}
      <div className="p-5 border-b border-gray-50">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: app.bg }}>
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-gray-900 text-sm">{app.name}</h3>
              {isReady
                ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ✓ প্রস্তুত
                  </span>
                : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    ডেটা অসম্পূর্ণ
                  </span>
              }
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{app.desc}</p>
          </div>
        </div>

        {/* Missing data warning */}
        {!isReady && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-2.5
            flex items-start gap-2 text-xs text-amber-700">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              প্রয়োজনীয় ডেটা নেই:{' '}
              {missingData.map(m => ({
                siteInfo:     'সাইট ইনফো',
                bnbcSettings: 'BNBC সেটিংস',
                buildingInfo: 'ভবনের তথ্য',
              }[m])).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3.5 flex gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading || !isReady}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3
            rounded-xl text-sm font-semibold transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isReady ? app.color : '#9CA3AF',
            color: 'white',
          }}
        >
          {downloading
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />
          }
          JSON Download
        </button>

        <button
          onClick={handleCopy}
          disabled={copying || !isReady}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl
            text-sm font-semibold border-2 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            ${copied
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
        >
          {copied
            ? <CheckCircle size={15} />
            : copying
              ? <Loader2 size={15} className="animate-spin" />
              : <Copy size={15} />
          }
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
