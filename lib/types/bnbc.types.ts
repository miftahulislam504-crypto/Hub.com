// lib/types/bnbc.types.ts

export interface BNBCSettings {
  id: string
  projectId: string

  // Occupancy
  occupancyType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  riskCategory: 'I' | 'II' | 'III' | 'IV'

  // Seismic
  seismicZone: 'Z1' | 'Z2' | 'Z3' | 'Z4'
  seismicZoneCoeff: number        // Z value (auto)
  importanceFactor: number        // I (auto)

  // Wind
  windZone: 'A' | 'B' | 'C'
  basicWindSpeed: number          // km/h (auto)

  // Live Load
  liveLoadType: string
  liveLoadValue: number           // kN/m²

  // Soil (linked from Site Info)
  soilType: 'S1' | 'S2' | 'S3' | 'S4'

  // Computed
  spectralAcceleration: number    // Ss (auto, BNBC 2020)
  responseModFactor: number       // R (user selects structural system)
  structuralSystem: string

  createdAt: Date
  updatedAt?: Date
}

export type BNBCFormData = Omit<BNBCSettings, 'id' | 'projectId' | 'createdAt' | 'updatedAt'
  | 'seismicZoneCoeff' | 'importanceFactor' | 'basicWindSpeed' | 'spectralAcceleration'
  | 'riskCategory' | 'responseModFactor'>

// ─── Occupancy Types ─────────────────────────────────────────────────────────
export const OCCUPANCY_TYPES = [
  {
    code: 'A' as const,
    name: 'কৃষি',
    nameEn: 'Agricultural',
    desc: 'গুদাম, কৃষিজ স্থাপনা',
    riskCategory: 'I' as const,
    color: '#2E7D32',
  },
  {
    code: 'B' as const,
    name: 'আবাসিক',
    nameEn: 'Residential',
    desc: 'বাড়ি, অ্যাপার্টমেন্ট, হোস্টেল',
    riskCategory: 'II' as const,
    color: '#1565C0',
  },
  {
    code: 'C' as const,
    name: 'বাণিজ্যিক',
    nameEn: 'Commercial',
    desc: 'দোকান, অফিস, হোটেল, বাজার',
    riskCategory: 'II' as const,
    color: '#E65100',
  },
  {
    code: 'D' as const,
    name: 'শিল্প',
    nameEn: 'Industrial',
    desc: 'কারখানা, শিল্প প্রতিষ্ঠান',
    riskCategory: 'II' as const,
    color: '#4A148C',
  },
  {
    code: 'E' as const,
    name: 'প্রাতিষ্ঠানিক',
    nameEn: 'Institutional',
    desc: 'হাসপাতাল, স্কুল, সরকারি ভবন',
    riskCategory: 'III' as const,
    color: '#B71C1C',
  },
  {
    code: 'F' as const,
    name: 'বিবিধ',
    nameEn: 'Miscellaneous',
    desc: 'উপরের কোনোটিতে না পড়লে',
    riskCategory: 'II' as const,
    color: '#546E7A',
  },
] as const

// ─── Risk Categories ─────────────────────────────────────────────────────────
export const RISK_CATEGORIES = [
  { code: 'I'  as const, label: 'Category I',   desc: 'কম ঝুঁকি — কৃষি, অস্থায়ী',         color: '#2E7D32' },
  { code: 'II' as const, label: 'Category II',  desc: 'সাধারণ ঝুঁকি — আবাসিক, বাণিজ্যিক', color: '#1565C0' },
  { code: 'III'as const, label: 'Category III', desc: 'উচ্চ ঝুঁকি — হাসপাতাল, স্কুল',      color: '#E65100' },
  { code: 'IV' as const, label: 'Category IV',  desc: 'অতি উচ্চ ঝুঁকি — জরুরি সেবা',       color: '#B71C1C' },
] as const

// ─── Seismic Zones (Bangladesh BNBC 2020) ───────────────────────────────────
export const SEISMIC_ZONES = [
  {
    code: 'Z1' as const,
    label: 'জোন ১',
    Z: 0.12,
    desc: 'নিম্ন ভূমিকম্প ঝুঁকি',
    districts: 'বরিশাল, খুলনা, পটুয়াখালী, বরগুনা',
    color: '#2E7D32',
  },
  {
    code: 'Z2' as const,
    label: 'জোন ২',
    Z: 0.20,
    desc: 'মাঝারি ভূমিকম্প ঝুঁকি',
    districts: 'ঢাকা, রাজশাহী, ফরিদপুর, কুমিল্লা, নোয়াখালী',
    color: '#F9A825',
  },
  {
    code: 'Z3' as const,
    label: 'জোন ৩',
    Z: 0.28,
    desc: 'উচ্চ ভূমিকম্প ঝুঁকি',
    districts: 'চট্টগ্রাম, সিলেট, হবিগঞ্জ, মৌলভীবাজার',
    color: '#E65100',
  },
  {
    code: 'Z4' as const,
    label: 'জোন ৪',
    Z: 0.36,
    desc: 'অতি উচ্চ ভূমিকম্প ঝুঁকি',
    districts: 'ময়মনসিংহ, শেরপুর, নেত্রকোণা, সুনামগঞ্জ, কিশোরগঞ্জ',
    color: '#B71C1C',
  },
] as const

// ─── Wind Zones (Bangladesh BNBC 2020) ──────────────────────────────────────
export const WIND_ZONES = [
  {
    code: 'A' as const,
    label: 'জোন A',
    speed: 150,
    desc: 'অভ্যন্তরীণ এলাকা — ঢাকা, রাজশাহী, ময়মনসিংহ',
    color: '#1565C0',
  },
  {
    code: 'B' as const,
    label: 'জোন B',
    speed: 180,
    desc: 'মধ্যবর্তী এলাকা — চট্টগ্রাম, সিলেট, কুমিল্লা',
    color: '#E65100',
  },
  {
    code: 'C' as const,
    label: 'জোন C',
    speed: 210,
    desc: 'উপকূলীয় এলাকা — কক্সবাজার, বরিশাল, খুলনা',
    color: '#B71C1C',
  },
] as const

// ─── Live Load Types (BNBC 2020 Table 6.2.1) ────────────────────────────────
export const LIVE_LOAD_TYPES = [
  { label: 'আবাসিক (Residential)',             value: 2.0  },
  { label: 'অফিস (Office)',                    value: 2.5  },
  { label: 'শ্রেণিকক্ষ (Classroom)',           value: 3.0  },
  { label: 'দোকান / বাণিজ্যিক (Commercial)',   value: 4.0  },
  { label: 'গুদাম হালকা (Light Storage)',      value: 6.0  },
  { label: 'গুদাম ভারী (Heavy Storage)',       value: 12.0 },
  { label: 'হাসপাতাল (Hospital)',              value: 3.0  },
  { label: 'হোটেল (Hotel)',                    value: 2.0  },
  { label: 'ছাদ (Roof — Accessible)',          value: 1.5  },
  { label: 'ছাদ (Roof — Inaccessible)',        value: 0.75 },
  { label: 'সিঁড়ি (Staircase)',               value: 3.0  },
  { label: 'সমাবেশ (Assembly)',                value: 5.0  },
] as const

// ─── Structural Systems ──────────────────────────────────────────────────────
export const STRUCTURAL_SYSTEMS = [
  { label: 'RC Moment Resisting Frame (SMRF)',  R: 8.0  },
  { label: 'RC Moment Resisting Frame (IMRF)',  R: 5.0  },
  { label: 'RC Shear Wall',                     R: 6.0  },
  { label: 'RC Dual System (Frame + Wall)',      R: 8.0  },
  { label: 'Steel Moment Frame (SMF)',           R: 8.0  },
  { label: 'Steel Braced Frame (CBF)',           R: 6.0  },
  { label: 'Masonry Shear Wall',                R: 2.5  },
] as const

// ─── Auto Calculations ───────────────────────────────────────────────────────

export function getImportanceFactor(riskCategory: string): number {
  switch (riskCategory) {
    case 'I':   return 1.00
    case 'II':  return 1.00
    case 'III': return 1.25
    case 'IV':  return 1.50
    default:    return 1.00
  }
}

export function getSeismicZoneCoeff(zone: string): number {
  return SEISMIC_ZONES.find(z => z.code === zone)?.Z ?? 0.20
}

export function getBasicWindSpeed(windZone: string): number {
  return WIND_ZONES.find(w => w.code === windZone)?.speed ?? 150
}

export function getRiskCategory(occupancy: string): BNBCSettings['riskCategory'] {
  return OCCUPANCY_TYPES.find(o => o.code === occupancy)?.riskCategory ?? 'II'
}

// Spectral acceleration Ss (simplified BNBC 2020)
export function getSpectralAcceleration(zone: string, soilType: string): number {
  const Z = getSeismicZoneCoeff(zone)
  const Fa: Record<string, number> = { S1: 0.8, S2: 1.0, S3: 1.2, S4: 1.6 }
  return Z * (Fa[soilType] ?? 1.0) * 2.5
}
