// lib/types/site-info.types.ts

export interface SiteInfo {
  id: string
  projectId: string

  // Address
  address: string
  district: string
  upazila: string

  // GPS
  latitude?: number
  longitude?: number

  // Plot
  plotArea?: number
  plotAreaUnit: 'sqm' | 'sqft' | 'katha' | 'bigha'
  roadWidth?: number
  roadType?: 'paved' | 'unpaved' | 'both'

  // BNBC Soil
  soilType: 'S1' | 'S2' | 'S3' | 'S4'

  // Levels
  groundLevel?: number
  floodLevel?: number
  groundwaterDepth?: number

  // Notes
  notes?: string

  createdAt: Date
  updatedAt?: Date
}

export type SiteInfoFormData = Omit<SiteInfo, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>

export const SOIL_TYPES = [
  {
    code: 'S1' as const,
    name: 'শক্ত পাথর',
    nameEn: 'Hard Rock',
    desc: 'vs > 800 m/s — পাহাড়ি এলাকা বা শিলা মাটি',
    example: 'পার্বত্য চট্টগ্রাম, সিলেটের পাহাড়',
    color: '#1B5E20',
    bg: '#E8F5E9',
  },
  {
    code: 'S2' as const,
    name: 'খুব ঘন / নরম পাথর',
    nameEn: 'Very Dense / Soft Rock',
    desc: '360 < vs ≤ 800 m/s — শক্ত মাটি বা নরম পাথর',
    example: 'রাজশাহী, বগুড়ার সিল্ট মাটি',
    color: '#2E7D32',
    bg: '#F1F8E9',
  },
  {
    code: 'S3' as const,
    name: 'শক্ত মাটি',
    nameEn: 'Stiff Soil',
    desc: '180 < vs ≤ 360 m/s — স্বাভাবিক মাটি',
    example: 'ঢাকার উঁচু এলাকা, চট্টগ্রাম সিটি',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    code: 'S4' as const,
    name: 'নরম কাদামাটি',
    nameEn: 'Soft Clay',
    desc: 'vs ≤ 180 m/s — নরম বা দুর্বল মাটি',
    example: 'নদীর পাড়, হাওর, উপকূলীয় এলাকা, ঢাকার নিম্নাঞ্চল',
    color: '#B71C1C',
    bg: '#FFEBEE',
  },
] as const

export const PLOT_UNITS = [
  { code: 'sqm',   label: 'বর্গমিটার (sqm)'  },
  { code: 'sqft',  label: 'বর্গফুট (sqft)'    },
  { code: 'katha', label: 'কাঠা'               },
  { code: 'bigha', label: 'বিঘা'               },
] as const

export const ROAD_TYPES = [
  { code: 'paved',   label: 'পাকা রাস্তা'       },
  { code: 'unpaved', label: 'কাঁচা রাস্তা'       },
  { code: 'both',    label: 'পাকা ও কাঁচা উভয়' },
] as const

// Unit conversions to sqm
export function toSqm(area: number, unit: string): number {
  switch (unit) {
    case 'sqft':  return area / 10.7639
    case 'katha': return area * 66.89
    case 'bigha': return area * 1337.8
    default:      return area // sqm
  }
}

export function toSqft(area: number, unit: string): number {
  return toSqm(area, unit) * 10.7639
}

export function toKatha(area: number, unit: string): number {
  return toSqm(area, unit) / 66.89
}
