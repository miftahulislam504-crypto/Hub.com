// components/site-info/SiteInfoForm.tsx
'use client'
import { useState } from 'react'
import { SiteInfo, SiteInfoFormData, ROAD_TYPES } from '@/lib/types/site-info.types'
import { ALL_DISTRICTS, getUpazilas } from '@/lib/data/bangladesh-locations'
import SoilTypeSelector from './SoilTypeSelector'
import PlotAreaInput    from './PlotAreaInput'
import GpsInput         from './GpsInput'
import { Save, Loader2, X } from 'lucide-react'

interface Props {
  projectId: string
  initial?: SiteInfo | null
  onSave: (data: SiteInfoFormData) => Promise<boolean>
  onCancel: () => void
  saving: boolean
}

const empty: SiteInfoFormData = {
  address: '', district: '', upazila: '',
  soilType: 'S2', plotAreaUnit: 'sqm',
}

export default function SiteInfoForm({ initial, onSave, onCancel, saving }: Props) {
  const [form, setForm] = useState<SiteInfoFormData>(
    initial
      ? {
          address: initial.address, district: initial.district, upazila: initial.upazila,
          latitude: initial.latitude, longitude: initial.longitude,
          plotArea: initial.plotArea, plotAreaUnit: initial.plotAreaUnit,
          roadWidth: initial.roadWidth, roadType: initial.roadType,
          soilType: initial.soilType,
          groundLevel: initial.groundLevel, floodLevel: initial.floodLevel,
          groundwaterDepth: initial.groundwaterDepth, notes: initial.notes,
        }
      : empty
  )
  const [error, setError] = useState('')

  const set = <K extends keyof SiteInfoFormData>(k: K, v: SiteInfoFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const upazilas = getUpazilas(form.district)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.address.trim()) { setError('ঠিকানা দিন'); return }
    if (!form.district)       { setError('জেলা নির্বাচন করুন'); return }
    if (!form.upazila)        { setError('উপজেলা নির্বাচন করুন'); return }
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

      {/* ১. Address */}
      <Section title="📍 ঠিকানা">
        <div>
          <Label text="সম্পূর্ণ ঠিকানা" required />
          <input value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="বাড়ি নং, সড়ক, এলাকা"
            className="input-field" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label text="জেলা" required />
            <select value={form.district}
              onChange={e => { set('district', e.target.value); set('upazila', '') }}
              className="input-field" required>
              <option value="">জেলা বাছুন</option>
              {ALL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label text="উপজেলা / থানা" required />
            <select value={form.upazila}
              onChange={e => set('upazila', e.target.value)}
              className="input-field" required
              disabled={!form.district}>
              <option value="">উপজেলা বাছুন</option>
              {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ২. Soil Type */}
      <Section title="🪨 মাটির ধরন (BNBC 2020)">
        <SoilTypeSelector
          value={form.soilType}
          onChange={v => set('soilType', v as SiteInfoFormData['soilType'])}
        />
      </Section>

      {/* ৩. Plot */}
      <Section title="📐 প্লট ও রাস্তার তথ্য">
        <div>
          <Label text="প্লট এরিয়া" />
          <PlotAreaInput
            area={form.plotArea}
            unit={form.plotAreaUnit}
            onAreaChange={v => set('plotArea', v)}
            onUnitChange={v => set('plotAreaUnit', v as SiteInfoFormData['plotAreaUnit'])}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label text="রাস্তার প্রশস্ততা (মিটার)" />
            <input type="number" min={0} step="0.1"
              value={form.roadWidth ?? ''}
              onChange={e => set('roadWidth', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="যেমন: 6"
              className="input-field" />
          </div>
          <div>
            <Label text="রাস্তার ধরন" />
            <select value={form.roadType ?? ''}
              onChange={e => set('roadType', e.target.value as SiteInfoFormData['roadType'] || undefined)}
              className="input-field">
              <option value="">নির্বাচন করুন</option>
              {ROAD_TYPES.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* ৪. GPS */}
      <Section title="🛰️ GPS অবস্থান (ঐচ্ছিক)">
        <GpsInput
          lat={form.latitude}
          lng={form.longitude}
          onLatChange={v => set('latitude', v)}
          onLngChange={v => set('longitude', v)}
        />
      </Section>

      {/* ৫. Levels */}
      <Section title="📊 উচ্চতা ও স্তর (ঐচ্ছিক)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label text="ভূমি উচ্চতা MSL (m)" />
            <input type="number" step="0.01"
              value={form.groundLevel ?? ''}
              onChange={e => set('groundLevel', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="মিটার" className="input-field" />
          </div>
          <div>
            <Label text="সর্বোচ্চ বন্যা স্তর (m)" />
            <input type="number" step="0.01"
              value={form.floodLevel ?? ''}
              onChange={e => set('floodLevel', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="মিটার" className="input-field" />
          </div>
          <div>
            <Label text="ভূগর্ভস্থ পানি (m)" />
            <input type="number" step="0.01"
              value={form.groundwaterDepth ?? ''}
              onChange={e => set('groundwaterDepth', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="মিটার" className="input-field" />
          </div>
        </div>
      </Section>

      {/* ৬. Notes */}
      <Section title="📝 মন্তব্য (ঐচ্ছিক)">
        <textarea value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value || undefined)}
          placeholder="অতিরিক্ত তথ্য বা মন্তব্য..."
          rows={3} className="input-field resize-none" maxLength={500} />
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <button type="button" onClick={onCancel}
          className="btn-outline flex-1 gap-2">
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

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  )
}
