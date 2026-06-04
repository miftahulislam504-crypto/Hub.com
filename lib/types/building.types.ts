// lib/types/building.types.ts

export interface BuildingInfo {
  id: string
  projectId: string

  // Type
  buildingType:   'RCC' | 'Steel' | 'Masonry' | 'Composite'
  usageType:      string
  structureSystem: string

  // Floors
  numFloors:      number
  basementCount:  number
  floorHeight:    number    // meter (typical)
  totalHeight:    number    // meter (auto = floors × floorHeight)
  groundFloorHeight: number // meter

  // Roof
  roofType: 'Flat' | 'Sloped' | 'Combined'

  // Dimensions
  buildingLength?: number   // meter
  buildingWidth?:  number   // meter
  totalFloorArea?: number   // sqm (auto = L × W × floors)

  // Special
  hasLift:       boolean
  hasGenerator:  boolean
  hasWaterTank:  boolean
  hasParkingFloor: boolean

  // Notes
  notes?: string

  createdAt: Date
  updatedAt?: Date
}

export type BuildingFormData = Omit<BuildingInfo,
  'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'totalHeight' | 'totalFloorArea'>

// ─── Building Types ───────────────────────────────────────────────────────────
export const BUILDING_TYPES = [
  {
    code: 'RCC' as const,
    name: 'RCC ফ্রেম',
    nameEn: 'Reinforced Concrete',
    desc: 'কংক্রিট কলাম, বিম ও স্ল্যাব',
    icon: '🏛️',
    color: '#1565C0',
  },
  {
    code: 'Steel' as const,
    name: 'স্টিল স্ট্রাকচার',
    nameEn: 'Steel Structure',
    desc: 'স্টিল কলাম ও বিম',
    icon: '⚙️',
    color: '#37474F',
  },
  {
    code: 'Masonry' as const,
    name: 'ম্যাসনরি',
    nameEn: 'Masonry / Brick',
    desc: 'ইট-সিমেন্টের দেয়াল',
    icon: '🧱',
    color: '#BF360C',
  },
  {
    code: 'Composite' as const,
    name: 'কম্পোজিট',
    nameEn: 'Composite Structure',
    desc: 'RCC + Steel মিশ্রিত',
    icon: '🔧',
    color: '#4A148C',
  },
] as const

// ─── Usage Types ──────────────────────────────────────────────────────────────
export const USAGE_TYPES = [
  'আবাসিক — একক পরিবার (Residential Single)',
  'আবাসিক — বহু পরিবার (Residential Multi)',
  'বাণিজ্যিক — অফিস (Commercial Office)',
  'বাণিজ্যিক — দোকান/শপিং (Commercial Retail)',
  'হোটেল / রেস্তোরাঁ (Hotel/Restaurant)',
  'হাসপাতাল / ক্লিনিক (Hospital)',
  'শিক্ষা প্রতিষ্ঠান (Educational)',
  'শিল্প / কারখানা (Industrial)',
  'মিশ্র (Mixed Use)',
  'সরকারি / প্রশাসনিক (Government)',
  'ধর্মীয় (Religious)',
] as const

// ─── Roof Types ───────────────────────────────────────────────────────────────
export const ROOF_TYPES = [
  { code: 'Flat'     as const, label: 'সমতল ছাদ (Flat Roof)',         icon: '▬' },
  { code: 'Sloped'   as const, label: 'ঢালু ছাদ (Sloped/Pitched)',    icon: '🏠' },
  { code: 'Combined' as const, label: 'মিশ্র (Combined)',              icon: '🏗️' },
] as const

// ─── Auto calculations ────────────────────────────────────────────────────────
export function calcTotalHeight(
  numFloors: number,
  floorHeight: number,
  groundFloorHeight: number,
  basementCount: number
): number {
  // total = ground floor + typical floors above + basement below
  const aboveGround = groundFloorHeight + (numFloors - 1) * floorHeight
  return Math.round(aboveGround * 100) / 100
}

export function calcTotalFloorArea(
  length: number,
  width: number,
  numFloors: number,
  basementCount: number
): number {
  return Math.round(length * width * (numFloors + basementCount) * 100) / 100
}
