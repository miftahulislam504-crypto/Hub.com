// components/bnbc/BNBCResultsCard.tsx
'use client'
import {
  getImportanceFactor, getSeismicZoneCoeff, getBasicWindSpeed,
  getSpectralAcceleration, getRiskCategory,
  SEISMIC_ZONES, WIND_ZONES, STRUCTURAL_SYSTEMS,
} from '@/lib/types/bnbc.types'

interface Props {
  occupancyType: string
  seismicZone:   string
  windZone:      string
  soilType:      string
  structuralSystem: string
}

export default function BNBCResultsCard({
  occupancyType, seismicZone, windZone, soilType, structuralSystem,
}: Props) {
  const riskCategory     = getRiskCategory(occupancyType)
  const I                = getImportanceFactor(riskCategory)
  const Z                = getSeismicZoneCoeff(seismicZone)
  const V                = getBasicWindSpeed(windZone)
  const Ss               = getSpectralAcceleration(seismicZone, soilType)
  const R                = STRUCTURAL_SYSTEMS.find(s => s.label === structuralSystem)?.R ?? 5.0
  const Cs               = (Ss * I) / R    // Seismic response coefficient
  const zoneData         = SEISMIC_ZONES.find(z => z.code === seismicZone)
  const windData         = WIND_ZONES.find(w => w.code === windZone)

  const results = [
    {
      group: '🏛️ Occupancy',
      items: [
        { label: 'Occupancy Type',  value: `Type ${occupancyType}`,    unit: '' },
        { label: 'Risk Category',   value: `Category ${riskCategory}`, unit: '' },
        { label: 'Importance (I)',  value: I.toFixed(2),               unit: '', highlight: true },
      ],
    },
    {
      group: '🌍 Seismic (BNBC 2020)',
      items: [
        { label: 'Seismic Zone',    value: zoneData?.label ?? seismicZone, unit: '' },
        { label: 'Zone Coeff (Z)',  value: Z.toFixed(2),               unit: '', highlight: true },
        { label: 'Soil Type',       value: soilType,                   unit: '' },
        { label: 'Spectral Acc (Ss)', value: Ss.toFixed(3),            unit: 'g', highlight: true },
        { label: 'Response Mod (R)',  value: R.toFixed(1),             unit: '' },
        { label: 'Seismic Cs',      value: Cs.toFixed(4),             unit: 'g', highlight: true },
      ],
    },
    {
      group: '💨 Wind (BNBC 2020)',
      items: [
        { label: 'Wind Zone',       value: windData?.label ?? windZone, unit: '' },
        { label: 'Basic Wind Speed', value: V.toString(),              unit: 'km/h', highlight: true },
      ],
    },
  ]

  return (
    <div className="bg-primary-900 rounded-2xl text-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/10">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          ⚡ Auto-Computed Results
        </h3>
        <p className="text-blue-300 text-xs mt-0.5">BNBC 2020 অনুযায়ী স্বয়ংক্রিয় গণনা</p>
      </div>

      <div className="p-5 space-y-5">
        {results.map(group => (
          <div key={group.group}>
            <div className="text-blue-300 text-xs font-semibold mb-2 uppercase tracking-wider">
              {group.group}
            </div>
            <div className="space-y-1.5">
              {group.items.map(item => (
                <div key={item.label}
                  className={`flex items-center justify-between rounded-xl px-3 py-2
                    ${item.highlight ? 'bg-white/15' : 'bg-white/5'}`}>
                  <span className="text-sm text-blue-200">{item.label}</span>
                  <span className={`font-mono font-bold text-sm
                    ${item.highlight ? 'text-white' : 'text-blue-100'}`}>
                    {item.value}
                    {item.unit && <span className="text-blue-300 font-normal ml-1 text-xs">{item.unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Export hint */}
      <div className="px-5 pb-4">
        <div className="bg-white/10 rounded-xl px-3 py-2 text-xs text-blue-300 text-center">
          💡 এই ডেটা Structural App স্বয়ংক্রিয়ভাবে ব্যবহার করবে
        </div>
      </div>
    </div>
  )
}
