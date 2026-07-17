// lib/firestore/report.firestore.ts
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { HubReport, ReportType, REPORT_TYPE_LABELS_BN } from '@/lib/types/report.types'
import { ModuleId } from '@/lib/types/dependency.types'
import { getModuleVersion } from '@/lib/firestore/dependency.firestore'
import { emitEvent } from '@/lib/firestore/event.firestore'
import { getSiteInfo } from '@/lib/firestore/site-info.firestore'
import { getBNBCSettings } from '@/lib/firestore/bnbc.firestore'
import { getBuildingInfo } from '@/lib/firestore/building.firestore'
import {
  getImportanceFactor, getSpectralAcceleration, RISK_CATEGORIES, SEISMIC_ZONES, WIND_ZONES,
} from '@/lib/types/bnbc.types'
import { SOIL_TYPES, toSqft } from '@/lib/types/site-info.types'
import { BUILDING_TYPES } from '@/lib/types/building.types'

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  return new Date().toISOString()
}

// দুইটা report (একই module, একই type) হলে overwrite হয় — deterministic id,
// আলাদা history subcollection রাখা হয়নি (report একটা snapshot, approval-এর
// মতো audit trail দরকার নেই — শুধু সর্বশেষটাই দরকারী)।
const reportId = (module: ModuleId, type: ReportType) => `RPT-${module}-${type}`

// ─── Registry ─────────────────────────────────────────────────────────────

export async function registerReport(
  projectId: string,
  module: ModuleId,
  type: ReportType,
  content: string,
  sourceVersion: number,
  generatedBy?: { uid: string; displayName: string | null }
): Promise<void> {
  const id = reportId(module, type)
  const ref = doc(db, 'projects', projectId, 'reports', id)
  const existing = await getDoc(ref)
  const nextVersion = existing.exists() ? (existing.data().version ?? 1) + 1 : 1

  await setDoc(ref, {
    projectId, module, type,
    title: REPORT_TYPE_LABELS_BN[type],
    version: nextVersion,
    sourceVersion,
    content,
    generatedAt: serverTimestamp(),
    ...(generatedBy ? { generatedBy } : {}),
  })

  try {
    await emitEvent(projectId, 'REPORT_GENERATED', 'hub', { reportId: id, module, reportType: type })
  } catch (_) { /* non-critical */ }
}

export async function getProjectReports(projectId: string): Promise<HubReport[]> {
  const snaps = await getDocs(collection(db, 'projects', projectId, 'reports'))
  return snaps.docs.map(s => {
    const d = s.data()
    return {
      id: s.id,
      projectId,
      module: d.module,
      type: d.type,
      title: d.title,
      version: d.version ?? 1,
      sourceVersion: d.sourceVersion ?? 0,
      content: d.content ?? '',
      generatedAt: toISO(d.generatedAt),
      generatedBy: d.generatedBy,
    }
  })
}

// ─── Genuine generators — শুধু Hub-এর ৩টা module-এর জন্য, real ডেটা থেকে ───
// বাকি ১৫টা report type-এর কোনো generator নেই ইচ্ছাকৃতভাবে — কোনো real
// source data নেই।

export async function generateSiteInfoSummary(projectId: string): Promise<HubReport | null> {
  const site = await getSiteInfo(projectId)
  if (!site) return null

  const soil = SOIL_TYPES.find(s => s.code === site.soilType)
  const areaSqft = site.plotArea ? toSqft(site.plotArea, site.plotAreaUnit) : null

  const content = [
    `# সাইট ইনফরমেশন সারাংশ`,
    ``,
    `**ঠিকানা:** ${site.address}, ${site.upazila}, ${site.district}`,
    site.plotArea ? `**প্লট আয়তন:** ${site.plotArea} ${site.plotAreaUnit}${areaSqft ? ` (≈ ${areaSqft.toFixed(1)} sqft)` : ''}` : null,
    site.roadWidth ? `**রাস্তার প্রস্থ:** ${site.roadWidth} মিটার (${site.roadType ?? 'অজানা ধরন'})` : null,
    `**মাটির ধরন (BNBC):** ${site.soilType}${soil ? ` — ${soil.name} (${soil.nameEn})` : ''}`,
    site.groundLevel != null ? `**গ্রাউন্ড লেভেল:** ${site.groundLevel} মিটার` : null,
    site.floodLevel != null ? `**বন্যা স্তর:** ${site.floodLevel} মিটার` : null,
    site.groundwaterDepth != null ? `**ভূগর্ভস্থ পানির গভীরতা:** ${site.groundwaterDepth} মিটার` : null,
    site.notes ? `\n**নোট:** ${site.notes}` : null,
  ].filter(Boolean).join('\n')

  const version = await getModuleVersion(projectId, 'siteInfo')
  await registerReport(projectId, 'siteInfo', 'site_info_summary', content, version?.currentVersion ?? 1)
  return getReportById(projectId, 'siteInfo', 'site_info_summary')
}

export async function generateBnbcParametersReport(projectId: string): Promise<HubReport | null> {
  const bnbc = await getBNBCSettings(projectId)
  if (!bnbc) return null

  const risk = RISK_CATEGORIES.find(r => r.code === bnbc.riskCategory)
  const zone = SEISMIC_ZONES.find(z => z.code === bnbc.seismicZone)
  const wind = WIND_ZONES.find(w => w.code === bnbc.windZone)

  const content = [
    `# BNBC ডিজাইন প্যারামিটার রিপোর্ট`,
    ``,
    `## Occupancy ও ঝুঁকি`,
    `- **Occupancy Type:** ${bnbc.occupancyType}`,
    `- **Risk Category:** ${bnbc.riskCategory}${risk ? ` — ${risk.desc}` : ''}`,
    `- **Importance Factor (I):** ${getImportanceFactor(bnbc.riskCategory)}`,
    ``,
    `## ভূমিকম্প (Seismic)`,
    `- **Zone:** ${bnbc.seismicZone}${zone ? ` — ${zone.desc} (Z=${zone.Z})` : ''}`,
    `- **Soil Type:** ${bnbc.soilType} (Site Info থেকে)`,
    `- **Spectral Acceleration (Ss):** ${getSpectralAcceleration(bnbc.seismicZone, bnbc.soilType).toFixed(3)}`,
    `- **Response Modification Factor (R):** ${bnbc.responseModFactor} (${bnbc.structuralSystem})`,
    ``,
    `## বাতাস (Wind)`,
    `- **Zone:** ${bnbc.windZone}${wind ? ` — ${wind.desc}` : ''}`,
    `- **Basic Wind Speed:** ${bnbc.basicWindSpeed} km/h`,
    ``,
    `## Live Load`,
    `- **${bnbc.liveLoadType}:** ${bnbc.liveLoadValue} kN/m²`,
  ].join('\n')

  const version = await getModuleVersion(projectId, 'bnbcSettings')
  await registerReport(projectId, 'bnbcSettings', 'bnbc_parameters_report', content, version?.currentVersion ?? 1)
  return getReportById(projectId, 'bnbcSettings', 'bnbc_parameters_report')
}

export async function generateBuildingInfoSummary(projectId: string): Promise<HubReport | null> {
  const building = await getBuildingInfo(projectId)
  if (!building) return null

  const type = BUILDING_TYPES.find(t => t.code === building.buildingType)

  const content = [
    `# ভবনের তথ্য সারাংশ`,
    ``,
    `**ভবনের ধরন:** ${building.buildingType}${type ? ` — ${type.name}` : ''}`,
    `**ব্যবহার:** ${building.usageType}`,
    `**কাঠামো পদ্ধতি:** ${building.structureSystem}`,
    ``,
    `## তলা ও উচ্চতা`,
    `- **তলার সংখ্যা:** ${building.numFloors}${building.basementCount ? ` + ${building.basementCount} বেসমেন্ট` : ''}`,
    `- **সাধারণ তলার উচ্চতা:** ${building.floorHeight} মিটার`,
    `- **মোট উচ্চতা:** ${building.totalHeight} মিটার`,
    `- **ছাদের ধরন:** ${building.roofType}`,
    building.totalFloorArea ? `- **মোট ফ্লোর এরিয়া:** ${building.totalFloorArea.toFixed(1)} sqm` : null,
    ``,
    `## সুবিধা`,
    `- লিফট: ${building.hasLift ? 'হ্যাঁ' : 'না'}`,
    `- জেনারেটর: ${building.hasGenerator ? 'হ্যাঁ' : 'না'}`,
    `- পানির ট্যাংক: ${building.hasWaterTank ? 'হ্যাঁ' : 'না'}`,
    `- পার্কিং ফ্লোর: ${building.hasParkingFloor ? 'হ্যাঁ' : 'না'}`,
    building.notes ? `\n**নোট:** ${building.notes}` : null,
  ].filter(Boolean).join('\n')

  const version = await getModuleVersion(projectId, 'buildingInfo')
  await registerReport(projectId, 'buildingInfo', 'building_info_summary', content, version?.currentVersion ?? 1)
  return getReportById(projectId, 'buildingInfo', 'building_info_summary')
}

async function getReportById(projectId: string, module: ModuleId, type: ReportType): Promise<HubReport | null> {
  const snap = await getDoc(doc(db, 'projects', projectId, 'reports', reportId(module, type)))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id, projectId, module: d.module, type: d.type, title: d.title,
    version: d.version ?? 1, sourceVersion: d.sourceVersion ?? 0, content: d.content ?? '',
    generatedAt: toISO(d.generatedAt), generatedBy: d.generatedBy,
  }
}
