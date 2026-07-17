// lib/firestore/bnbc.firestore.ts
import {
  doc, getDoc, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BNBCSettings, BNBCFormData, ServiceResult } from '@/lib/types'
import {
  getImportanceFactor, getSeismicZoneCoeff,
  getBasicWindSpeed, getSpectralAcceleration,
  getRiskCategory, STRUCTURAL_SYSTEMS,
} from '@/lib/types/bnbc.types'
import { bumpModuleVersion, linkDependency, getModuleVersion } from '@/lib/firestore/dependency.firestore'

const bnbcRef = (projectId: string) =>
  doc(db, 'projects', projectId, 'bnbc_settings', 'data')

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

export async function getBNBCSettings(projectId: string): Promise<BNBCSettings | null> {
  const snap = await getDoc(bnbcRef(projectId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id, projectId,
    occupancyType:       d.occupancyType    ?? 'B',
    riskCategory:        d.riskCategory     ?? 'II',
    seismicZone:         d.seismicZone      ?? 'Z2',
    seismicZoneCoeff:    d.seismicZoneCoeff ?? 0.20,
    importanceFactor:    d.importanceFactor ?? 1.00,
    windZone:            d.windZone         ?? 'A',
    basicWindSpeed:      d.basicWindSpeed   ?? 150,
    liveLoadType:        d.liveLoadType     ?? 'আবাসিক (Residential)',
    liveLoadValue:       d.liveLoadValue    ?? 2.0,
    soilType:            d.soilType         ?? 'S2',
    spectralAcceleration:d.spectralAcceleration ?? 0,
    responseModFactor:   d.responseModFactor ?? 5.0,
    structuralSystem:    d.structuralSystem ?? 'RC Moment Resisting Frame (IMRF)',
    createdAt:           toDate(d.createdAt),
    updatedAt:           d.updatedAt ? toDate(d.updatedAt) : undefined,
  }
}

export async function saveBNBCSettings(
  projectId: string,
  form: BNBCFormData
): Promise<ServiceResult<BNBCSettings>> {
  try {
    const ref      = bnbcRef(projectId)
    const existing = await getDoc(ref)

    // Auto-compute derived values
    const riskCategory        = getRiskCategory(form.occupancyType)
    const importanceFactor    = getImportanceFactor(riskCategory)
    const seismicZoneCoeff    = getSeismicZoneCoeff(form.seismicZone)
    const basicWindSpeed      = getBasicWindSpeed(form.windZone)
    const spectralAcceleration= getSpectralAcceleration(form.seismicZone, form.soilType)
    const responseModFactor   = STRUCTURAL_SYSTEMS.find(
      s => s.label === form.structuralSystem
    )?.R ?? 5.0

    const payload = {
      projectId,
      ...form,
      riskCategory,
      importanceFactor,
      seismicZoneCoeff,
      basicWindSpeed,
      spectralAcceleration,
      responseModFactor,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    }

    await setDoc(ref, payload)

    // Version tracking + dependency link (Phase 2)
    // soilType সরাসরি Site Info থেকে আসে (bnbc.types.ts কমেন্ট অনুযায়ী) —
    // এটাই একমাত্র genuine cross-module link এখন পর্যন্ত, তাই এটাই record
    // করা হচ্ছে। SiteInfo আপডেট হয়ে soilType বদলালে এই BNBC record
    // OUTDATED দেখাবে যতক্ষণ না আবার save করে নতুন version link হয়।
    try {
      const newVersion = await bumpModuleVersion(projectId, 'bnbcSettings')
      const siteInfoVersion = await getModuleVersion(projectId, 'siteInfo')
      await linkDependency(
        projectId,
        'bnbcSettings',
        'siteInfo',
        siteInfoVersion?.currentVersion ?? 1,
        'soilType মান Site Info থেকে নেওয়া হয়েছে'
      )
      void newVersion
    } catch (_) { /* non-critical, don't block save on version tracking failure */ }

    // Activity log
    try {
      await setDoc(
        doc(db, 'projects', projectId, 'activity_logs', `bnbc_${Date.now()}`),
        { action: 'bnbc_saved', description: 'BNBC সেটিংস সংরক্ষিত', timestamp: serverTimestamp() }
      )
    } catch (_) { /* non-critical */ }

    const saved = await getBNBCSettings(projectId)
    return { success: true, data: saved! }
  } catch (e: unknown) {
    return { success: false, error: `BNBC সেটিংস সংরক্ষণ করতে সমস্যা: ${e}` }
  }
}
