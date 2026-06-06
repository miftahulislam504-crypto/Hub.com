// components/integration/JsonPreviewModal.tsx
'use client'
import { useState } from 'react'
import { HubExportPayload } from '@/lib/types/integration.types'
import { X, Copy, CheckCircle } from 'lucide-react'

interface Props {
  payload:  HubExportPayload
  onClose:  () => void
}

export default function JsonPreviewModal({ payload, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(payload, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-heading font-bold text-gray-900">JSON Preview</h3>
            <p className="text-xs text-gray-500 mt-0.5">{payload.projectCode} — {payload.projectName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm
                font-medium border-2 transition-all
                ${copied
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100
                rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* JSON content */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-xs text-gray-800 font-mono leading-relaxed
            bg-gray-50 rounded-xl p-4 whitespace-pre-wrap break-all">
            {json}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-blue-50">
          <p className="text-xs text-blue-700 flex items-start gap-1.5">
            <span className="flex-shrink-0">💡</span>
            এই JSON টা অন্য CivilOS App এ import করুন। ভবিষ্যতে API সংযোগ হলে স্বয়ংক্রিয়ভাবে transfer হবে।
          </p>
        </div>
      </div>
    </div>
  )
}
