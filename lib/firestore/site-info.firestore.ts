// lib/firestore/site-info.firestore.ts
import {
  doc, getDoc, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SiteInfo, SiteInfoFormData } from '@/lib/types/site-info.types'
import { ServiceResult } from '@/lib/types'

const siteRef = (projectId: string) =>
  doc(db, 'projects', projectId, 'site_information', 'data')

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate()
  return new Date()
}

export async function getSiteInfo(projectId: string): Promise<SiteInfo | null> {
  const snap = await getDoc(siteRef(projectId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id,
    projectId,
    address:          d.address ?? '',
    district:         d.district ?? '',
    upazila:          d.upazila ?? '',
    latitude:         d.latitude ?? undefined,
    longitude:        d.longitude ?? undefined,
    plotArea:         d.plotArea ?? undefined,
    plotAreaUnit:     d.plotAreaUnit ?? 'sqm',
    roadWidth:        d.roadWidth ?? undefined,
    roadType:         d.roadType ?? undefined,
    soilType:         d.soilType ?? 'S2',
    groundLevel:      d.groundLevel ?? undefined,
    floodLevel:       d.floodLevel ?? undefined,
    groundwaterDepth: d.groundwaterDepth ?? undefined,
    notes:            d.notes ?? undefined,
    createdAt:        toDate(d.createdAt),
    updatedAt:        d.updatedAt ? toDate(d.updatedAt) : undefined,
  }
}

export async function saveSiteInfo(
  projectId: string,
  data: SiteInfoFormData
): Promise<ServiceResult<SiteInfo>> {
  try {
    const ref = siteRef(projectId)
    const existing = await getDoc(ref)

    const payload = {
      projectId,
      address:          data.address,
      district:         data.district,
      upazila:          data.upazila,
      latitude:         data.latitude ?? null,
      longitude:        data.longitude ?? null,
      plotArea:         data.plotArea ?? null,
      plotAreaUnit:     data.plotAreaUnit,
      roadWidth:        data.roadWidth ?? null,
      roadType:         data.roadType ?? null,
      soilType:         data.soilType,
      groundLevel:      data.groundLevel ?? null,
      floodLevel:       data.floodLevel ?? null,
      groundwaterDepth: data.groundwaterDepth ?? null,
      notes:            data.notes ?? null,
      updatedAt:        serverTimestamp(),
      createdAt:        existing.exists()
                          ? existing.data().createdAt
                          : serverTimestamp(),
    }

    await setDoc(ref, payload)

    // Activity log
    try {
      await setDoc(
        doc(db, 'projects', projectId, 'activity_logs', `site_${Date.now()}`),
        { action: 'site_info_saved', description: 'সাইট ইনফরমেশন সংরক্ষিত', timestamp: serverTimestamp() }
      )
    } catch (_) { /* non-critical */ }

    const saved = await getSiteInfo(projectId)
    return { success: true, data: saved! }
  } catch (e: unknown) {
    return { success: false, error: `সাইট ইনফো সংরক্ষণ করতে সমস্যা: ${e}` }
  }
}
