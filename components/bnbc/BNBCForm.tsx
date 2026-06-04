// components/bnbc/BNBCForm.tsx
'use client'
import { useState } from 'react'
import { BNBCSettings, BNBCFormData, LIVE_LOAD_TYPES, STRUCTURAL_SYSTEMS } from '@/lib/types/bnbc.types'
import OccupancySelector  from './OccupancySelector'
import SeismicZoneSelector from './SeismicZoneSelector'
import WindZoneSelector    from './WindZoneSelector'
import BNBCResultsCard     from './BNBCResultsCard'
import { Save, Loader2, X } from 'lucide-react'

interface Props {
  initial?: BNBCSettings | null
  linkedSoilType?: 'S1' | 'S2' | 'S3' | 'S4'  // from SiteInfo
  onSave:   (data: BNBCFormData) => Promise<boolean>
  onCancel: () => void
  saving:   boolean
}

const defaults: BNBCFormData = {
  occupancyType:    'B',
  seismicZone:      'Z2',
  windZone:         'A',
  liveLoadType:     'আবাসিক (Residential)',
  liveLoadValue:    2.0,
  soilType:         'S2',
  structuralSystem: 'RC Moment Resisting Frame (IMRF)',
}

export default function BNBCForm({ initial, linkedSoilType, onSave, onCancel, saving }: Props) {
  const [form, setForm] = useState<BNBCFormData>(
    initial
      ? {
          occupancyType:    initial.occupancyType,
          seismicZone:      initial.seismicZone,
          windZone:         initial.windZone,
          liveLoadType:     initial.liveLoadType,
          liveLoadValue:    initial.liveLoadValue,
          soilType:         linkedSoilType ?? initial.soilType,
          structuralSystem: initial.structuralSystem,
        }
      : { ...defaults, soilType: linkedSoilType ?? 'S2' }
  )
  const [error, setError] = useState('')

  const set = <K extends keyof BNBCFormData>(k: K, v: BNBCFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleLiveLoad = (label: string) => {
    const found = LIVE_LOAD_TYPES.find(l => l.label === label)
    set('liveLoadType', label)
    if (found) set('liveLoadValue', found.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = await onSave(form)
    if (!ok) setError('সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Live preview — top */}
      <BNBCResultsCard
        occupancyType={form.occupancyType}
        seismicZone={form.seismicZone}
        windZone={form.windZone}
        soilType={form.soilType}
        structuralSystem={form.structuralSystem}
      />

      {/* 1. Occupancy */}
      <Section title="🏛️ অকুপেন্সি টাইপ">
        <OccupancySelector value={form.occupancyType} onChange={v => set('occupancyType', v as BNBCFormData['occupancyType'])} />
      </Section>

      {/* 2. Seismic Zone */}
      <Section title="🌍 ভূমিকম্প জোন (BNBC 2020)">
        <SeismicZoneSelector value={form.seismicZone} onChange={v => set('seismicZone', v as BNBCFormData['seismicZone'])} />
      </Section>

      {/* 3. Wind Zone */}
      <Section title="💨 বায়ু জোন (BNBC 2020)">
        <WindZoneSelector value={form.windZone} onChange={v => set('windZone', v as BNBCFormData['windZone'])} />
      </Section>

      {/* 4. Soil Type (linked) */}
      <Section title="🪨 মাটির ধরন">
        {linkedSoilType ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm">
            <span className="text-green-600">✓</span>
            <span className="text-green-800">
              সাইট ইনফো থেকে স্বয়ংক্রিয়ভাবে নেওয়া হয়েছে:
              <strong className="ml-1">{linkedSoilType}</strong>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['S1', 'S2', 'S3', 'S4'] as const).map(s => (
              <button key={s} type="button"
                onClick={() => set('soilType', s)}
                className={`rounded-xl border-2 py-3 font-bold font-heading text-lg transition-all
                  ${form.soilType === s
                    ? 'border-primary-900 bg-primary-50 text-primary-900'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                  }`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* 5. Structural System */}
      <Section title="🏗️ Structural System">
        <div className="space-y-2">
          {STRUCTURAL_SYSTEMS.map(sys => (
            <button key={sys.label} type="button"
              onClick={() => set('structuralSystem', sys.label)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all flex items-center justify-between
                ${form.structuralSystem === sys.label
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
                }`}>
              <span className={`text-sm font-medium ${form.structuralSystem === sys.label ? 'text-primary-900' : 'text-gray-700'}`}>
                {sys.label}
              </span>
              <span className={`font-mono text-sm px-2 py-0.5 rounded-lg font-bold
                ${form.structuralSystem === sys.label ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                R = {sys.R}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 6. Live Load */}
      <Section title="⚖️ Live Load (BNBC Table 6.2.1)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ব্যবহারের ধরন</label>
            <select value={form.liveLoadType}
              onChange={e => handleLiveLoad(e.target.value)}
              className="input-field">
              {LIVE_LOAD_TYPES.map(l => (
                <option key={l.label} value={l.label}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Live Load মান (kN/m²)</label>
            <div className="relative">
              <input type="number" step="0.25" min={0}
                value={form.liveLoadValue}
                onChange={e => set('liveLoadValue', Number(e.target.value))}
                className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                kN/m²
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button type="button" onClick={onCancel} className="btn-outline flex-1">
          <X size={16} /> বাতিল
        </button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}
