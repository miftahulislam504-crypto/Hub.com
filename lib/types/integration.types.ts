// lib/types/integration.types.ts
import { CONTRACT_SCHEMA_VERSION } from './contract.types'

// ─── Master Export Schema ─────────────────────────────────────────────────────
// এই schema টা Hub থেকে সব app এ যাবে।
//
// `version` ফিল্ডটা পুরনো — কোনো consuming app এখনো ভেঙে না যায় সেজন্য
// রাখা হয়েছে। নতুন `contractSchemaVersion` ফিল্ডটা contract.types.ts এর
// CONTRACT_SCHEMA_VERSION এর সাথে সবসময় sync থাকবে — এটাই আসল ecosystem-wide
// schema version, `version` শুধু এই payload shape-এর নিজস্ব সংস্করণ।
export interface HubExportPayload {
  version:    '1.0'
  contractSchemaVersion: typeof CONTRACT_SCHEMA_VERSION
  exportedAt: string        // ISO date
  projectId:  string
  projectCode: string
  projectName: string

  siteInfo?:    SiteInfoExport
  bnbcSettings?: BNBCExport
  buildingInfo?: BuildingExport
}

export interface SiteInfoExport {
  address:          string
  district:         string
  upazila:          string
  latitude?:        number
  longitude?:       number
  plotArea?:        number
  plotAreaUnit?:    string
  plotAreaSqm?:     number    // always in sqm for calculation
  roadWidth?:       number
  soilType:         string    // S1-S4
  groundLevel?:     number
  floodLevel?:      number
  groundwaterDepth?: number
}

export interface BNBCExport {
  occupancyType:      string
  riskCategory:       string
  seismicZone:        string
  seismicZoneCoeff:   number   // Z
  importanceFactor:   number   // I
  windZone:           string
  basicWindSpeed:     number   // km/h
  liveLoadType:       string
  liveLoadValue:      number   // kN/m²
  soilType:           string
  spectralAcceleration: number // Ss
  responseModFactor:  number   // R
  structuralSystem:   string
  seismicCs:          number   // Cs = Ss×I/R
}

export interface BuildingExport {
  buildingType:      string
  usageType:         string
  structureSystem:   string
  numFloors:         number
  basementCount:     number
  floorHeight:       number
  groundFloorHeight: number
  totalHeight:       number
  roofType:          string
  buildingLength?:   number
  buildingWidth?:    number
  totalFloorArea?:   number
  hasLift:           boolean
  hasGenerator:      boolean
  hasWaterTank:      boolean
  hasParkingFloor:   boolean
}

// ─── Target Apps ──────────────────────────────────────────────────────────────
export const TARGET_APPS = [
  {
    id:       'structural',
    name:     'Structural Analysis & Design',
    icon:     '🏗️',
    color:    '#1565C0',
    bg:       '#E3F2FD',
    needs:    ['bnbcSettings', 'buildingInfo', 'siteInfo'] as const,
    desc:     'BNBC সেটিংস + ভবনের তথ্য + মাটির ধরন',
    status:   'ready',
  },
  {
    id:       'architectural',
    name:     'Architectural Drawing',
    icon:     '📐',
    color:    '#2E7D32',
    bg:       '#E8F5E9',
    needs:    ['siteInfo', 'buildingInfo'] as const,
    desc:     'সাইট ইনফো + ভবনের মাপ ও তলার সংখ্যা',
    status:   'ready',
  },
  {
    id:       'estimating',
    name:     'Estimating, Costing & BOQ',
    icon:     '📋',
    color:    '#E65100',
    bg:       '#FBE9E7',
    needs:    ['buildingInfo', 'bnbcSettings'] as const,
    desc:     'ভবনের তথ্য + Live Load',
    status:   'ready',
  },
  {
    id:       'projectmgmt',
    name:     'Project Management',
    icon:     '📊',
    color:    '#4A148C',
    bg:       '#F3E5F5',
    needs:    [] as const,
    desc:     'Project Registry + সব Data',
    status:   'ready',
  },
  {
    id:       'reports',
    name:     'Reports App',
    icon:     '📑',
    color:    '#37474F',
    bg:       '#ECEFF1',
    needs:    ['siteInfo', 'bnbcSettings', 'buildingInfo'] as const,
    desc:     'সম্পূর্ণ ডেটা — সব App এর output',
    status:   'ready',
  },
] as const

export type TargetAppId = typeof TARGET_APPS[number]['id']
