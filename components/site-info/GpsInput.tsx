// components/site-info/GpsInput.tsx
'use client'
import { useState } from 'react'
import { MapPin, Clipboard, HelpCircle, CheckCircle } from 'lucide-react'

interface Props {
  lat?: number
  lng?: number
  onLatChange: (v: number | undefined) => void
  onLngChange: (v: number | undefined) => void
}

export default function GpsInput({ lat, lng, onLatChange, onLngChange }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [pasted,   setPasted]   = useState(false)

  const isValid = lat !== undefined && lng !== undefined &&
    lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      // Accept "23.810331, 90.412521" or "23.810331 90.412521"
      const parts = text.trim().split(/[\s,]+/)
      if (parts.length >= 2) {
        const parsedLat = parseFloat(parts[0])
        const parsedLng = parseFloat(parts[1])
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          onLatChange(parsedLat)
          onLngChange(parsedLng)
          setPasted(true)
          setTimeout(() => setPasted(false), 2500)
        }
      }
    } catch {
      alert('Clipboard access দেওয়া হয়নি। ম্যানুয়ালি টাইপ করুন।')
    }
  }

  return (
    <div className={`rounded-xl border-2 p-4 transition-colors
      ${isValid ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className={isValid ? 'text-green-600' : 'text-gray-400'} />
          <span className="font-medium text-gray-700 text-sm">GPS কো-অর্ডিনেট</span>
          {isValid && <CheckCircle size={14} className="text-green-600" />}
        </div>
        <button type="button" onClick={() => setShowHelp(!showHelp)}
          className="text-gray-400 hover:text-primary-900 transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>

      {/* Help box */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Google Maps থেকে কীভাবে পাবেন:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
            <li>Google Maps খুলুন</li>
            <li>সাইটে দীর্ঘক্ষণ press করুন</li>
            <li>উপরে ডিগ্রি সংখ্যায় ক্লিক করুন</li>
            <li>Copy করুন → নিচে Paste চাপুন</li>
          </ol>
          <p className="text-xs text-blue-500 mt-1">উদাহরণ: 23.810331, 90.412521</p>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Latitude (উত্তর)</label>
          <input
            type="number" step="any"
            value={lat ?? ''}
            onChange={e => onLatChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="23.8103..."
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Longitude (পূর্ব)</label>
          <input
            type="number" step="any"
            value={lng ?? ''}
            onChange={e => onLngChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="90.4125..."
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Paste button */}
      <button type="button" onClick={handlePaste}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          border-2 transition-all w-full justify-center
          ${pasted
            ? 'border-green-400 bg-green-50 text-green-700'
            : 'border-primary-900 text-primary-900 hover:bg-primary-50'
          }`}>
        {pasted ? <CheckCircle size={15} /> : <Clipboard size={15} />}
        {pasted ? 'সফলভাবে paste হয়েছে!' : 'Google Maps থেকে Paste করুন'}
      </button>
    </div>
  )
}
