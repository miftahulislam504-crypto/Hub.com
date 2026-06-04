// components/building/BuildingForm.tsx
'use client'
import { useState, useMemo } from 'react'
import {
  BuildingInfo, BuildingFormData,
  USAGE_TYPES, ROOF_TYPES,
  calcTotalHeight, calcTotalFloorArea,
} from '@/lib/types/building.types'
import BuildingTypeSelector from './BuildingTypeSelector'
import { Save, Loader2, X } from 'lucide-react'

interface Props {
  initial?: BuildingInfo | null
  onSave:   (data: BuildingFormData) => Promise<boolean>
  onCancel: () => void
  saving:   boolean
}

const defaults: BuildingFormData = {
  buildingType:      'RCC',
  usageType:         USAGE_TYPES[0],
  structureSystem:   '',
  numFloors:         5,
  basementCount:     0,
  floorHeight:       3.0,
  groundFloorHeight: 3.5,
  roofType:          'Flat',
  hasLift:           false,
  hasGenerator:      false,
  hasWaterTank:      true,
  hasParkingFloor:   false,
}

export default function BuildingForm({ initial, onSave, onCancel, saving }: Props) {
  const [form, setForm] = useState<BuildingFormData>(
    initial
      ? {
          buildingType:      initial.buildingType,
          usageType:         initial.usageType,
          structureSystem:   initial.structureSystem,
          numFloors:         initial.numFloors,
          basementCount:     initial.basementCount,
          floorHeight:       initial.floorHeight,
          groundFloorHeight: initial.groundFloorHeight,
          roofType:          initial.roofType,
          buildingLength:    initial.buildingLength,
          buildingWidth:     initial.buildingWidth,
          hasLift:           initial.hasLift,
          hasGenerator:      initial.hasGenerator,
          hasWaterTank:      initial.hasWaterTank,
          hasParkingFloor:   initial.hasParkingFloor,
          notes:             initial.notes,
        }
      : defaults
  )
  const [error, setError] = useState('')

  const set = <K extends keyof BuildingFormData>(k: K, v: BuildingFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  // Live calculations
  const totalHeight = useMemo(() =>
    calcTotalHeight(form.numFloors, form.floorHeight, form.groundFloorHeight, form.basementCount),
    [form.numFloors, form.floorHeight, form.groundFloorHeight, form.basementCount]
  )

  const totalFloorArea = useMemo(() =>
    form.buildingLength && form.buildingWidth
      ? calcTotalFloorArea(form.buildingLength, form.buildingWidth, form.numFloors, form.basementCount)
      : null,
    [form.buildingLength, form.buildingWidth, form.numFloors, form.basementCount]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.numFloors < 1) { setError('তলার সংখ্যা কমপক্ষে ১ হতে হবে'); return }
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

      {/* Live preview */}
      <div className="bg-primary-900 rounded-2xl p-5 text-white">
        <p className="text-blue-300 text-xs mb-3 font-semibold uppercase tracking-wider">
          ⚡ Live Calculation
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'মোট তলা',         value: `${form.numFloors + form.basementCount}`, sub: `${form.numFloors}F + ${form.basementCount}B` },
            { label: 'মোট উচ্চতা',      value: `${totalHeight}m`,      sub: 'above ground' },
            { label: 'মোট এরিয়া',       value: totalFloorArea ? `${totalFloorArea} m²` : '—', sub: 'all floors' },
            { label: 'ছাদের ধরন',       value: form.roofType,           sub: 'roof type' },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-3">
              <div className="text-xs text-blue-300 mb-1">{item.label}</div>
              <div className="font-bold font-heading text-lg">{item.value}</div>
              <div className="text-xs text-blue-300">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Building Type */}
      <Section title="🏗️ ভবনের ধরন">
        <BuildingTypeSelector
          value={form.buildingType}
          onChange={v => set('buildingType', v as BuildingFormData['buildingType'])}
        />
      </Section>

      {/* 2. Usage */}
      <Section title="🏢 ব্যবহারের ধরন">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label text="ব্যবহার" required />
            <select value={form.usageType}
              onChange={e => set('usageType', e.target.value)}
              className="input-field" required>
              {USAGE_TYPES.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <Label text="Structural System (ঐচ্ছিক)" />
            <input value={form.structureSystem}
              onChange={e => set('structureSystem', e.target.value)}
              placeholder="যেমন: SMRF, Flat Plate"
              className="input-field" />
          </div>
        </div>
      </Section>

      {/* 3. Floors */}
      <Section title="📐 তলার তথ্য">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label text="তলার সংখ্যা (মাটির উপর)" required />
            <input type="number" min={1} max={100}
              value={form.numFloors}
              onChange={e => set('numFloors', Number(e.target.value))}
              className="input-field" required />
          </div>
          <div>
            <Label text="বেসমেন্ট তলা" />
            <input type="number" min={0} max={10}
              value={form.basementCount}
              onChange={e => set('basementCount', Number(e.target.value))}
              className="input-field" />
          </div>
          <div>
            <Label text="ছাদের ধরন" />
            <select value={form.roofType}
              onChange={e => set('roofType', e.target.value as BuildingFormData['roofType'])}
              className="input-field">
              {ROOF_TYPES.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* 4. Heights */}
      <Section title="📏 উচ্চতার তথ্য">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label text="গ্রাউন্ড ফ্লোর উচ্চতা (m)" required />
            <input type="number" min={2} max={20} step="0.1"
              value={form.groundFloorHeight}
              onChange={e => set('groundFloorHeight', Number(e.target.value))}
              className="input-field" />
          </div>
          <div>
            <Label text="সাধারণ তলার উচ্চতা (m)" required />
            <input type="number" min={2} max={10} step="0.1"
              value={form.floorHeight}
              onChange={e => set('floorHeight', Number(e.target.value))}
              className="input-field" />
          </div>
        </div>

        {/* Auto-computed total */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
          <span className="text-blue-500">📊</span>
          <span className="text-sm text-blue-800">
            মোট উচ্চতা (auto): <strong>{totalHeight} মিটার</strong>
            &nbsp;=&nbsp;
            {form.groundFloorHeight}m + ({form.numFloors - 1} × {form.floorHeight}m)
          </span>
        </div>
      </Section>

      {/* 5. Dimensions */}
      <Section title="📐 ভবনের মাপ (ঐচ্ছিক)">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label text="দৈর্ঘ্য (m)" />
            <input type="number" min={0} step="0.1"
              value={form.buildingLength ?? ''}
              onChange={e => set('buildingLength', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="মিটার" className="input-field" />
          </div>
          <div>
            <Label text="প্রস্থ (m)" />
            <input type="number" min={0} step="0.1"
              value={form.buildingWidth ?? ''}
              onChange={e => set('buildingWidth', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="মিটার" className="input-field" />
          </div>
        </div>

        {totalFloorArea && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
            📊 মোট ফ্লোর এরিয়া (auto): <strong>{totalFloorArea} m²</strong>
            &nbsp;= {form.buildingLength} × {form.buildingWidth} × {form.numFloors + form.basementCount} তলা
          </div>
        )}
      </Section>

      {/* 6. Amenities */}
      <Section title="🛗 সুবিধাদি">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'hasLift',         label: '🛗 লিফট',           },
            { key: 'hasGenerator',    label: '⚡ জেনারেটর',        },
            { key: 'hasWaterTank',    label: '💧 পানির ট্যাংক',    },
            { key: 'hasParkingFloor', label: '🚗 পার্কিং ফ্লোর',  },
          ].map(item => (
            <button key={item.key} type="button"
              onClick={() => set(item.key as keyof BuildingFormData, !form[item.key as keyof BuildingFormData] as BuildingFormData[keyof BuildingFormData])}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all flex items-center justify-between
                ${form[item.key as keyof BuildingFormData]
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                }`}>
              <span>{item.label}</span>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${form[item.key as keyof BuildingFormData] ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                {form[item.key as keyof BuildingFormData] && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 7. Notes */}
      <Section title="📝 মন্তব্য (ঐচ্ছিক)">
        <textarea value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value || undefined)}
          placeholder="অতিরিক্ত তথ্য বা বিশেষ নির্দেশনা..."
          rows={3} className="input-field resize-none" maxLength={500} />
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

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  )
}
