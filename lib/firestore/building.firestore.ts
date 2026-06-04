// lib/firestore/building.firestore.ts
import {
  doc, getDoc, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  BuildingInfo, BuildingFormData,
  calcTotalHeight, calcTotalFloorArea,
} from '@/lib/types/building.types'
import { ServiceResult } from '@/lib/types'

const buildingRef = (projectId: string) =>
  doc(db, 'projects', projectId, 'building_information', 'data')

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

export async function getBuildingInfo(projectId: string): Promise<BuildingInfo | null> {
  const snap = await getDoc(buildingRef(projectId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    id: snap.id,
    projectId,
    buildingType:       d.buildingType       ?? 'RCC',
    usageType:          d.usageType          ?? '',
    structureSystem:    d.structureSystem    ?? '',
    numFloors:          d.numFloors          ?? 1,
    basementCount:      d.basementCount      ?? 0,
    floorHeight:        d.floorHeight        ?? 3.0,
    groundFloorHeight:  d.groundFloorHeight  ?? 3.5,
    totalHeight:        d.totalHeight        ?? 0,
    roofType:           d.roofType           ?? 'Flat',
    buildingLength:     d.buildingLength     ?? undefined,
    buildingWidth:      d.buildingWidth      ?? undefined,
    totalFloorArea:     d.totalFloorArea     ?? undefined,
    hasLift:            d.hasLift            ?? false,
    hasGenerator:       d.hasGenerator       ?? false,
    hasWaterTank:       d.hasWaterTank       ?? false,
    hasParkingFloor:    d.hasParkingFloor    ?? false,
    notes:              d.notes              ?? undefined,
    createdAt:          toDate(d.createdAt),
    updatedAt:          d.updatedAt ? toDate(d.updatedAt) : undefined,
  }
}

export async function saveBuildingInfo(
  projectId: string,
  form: BuildingFormData
): Promise<ServiceResult<BuildingInfo>> {
  try {
    const ref      = buildingRef(projectId)
    const existing = await getDoc(ref)

    // Auto-compute
    const totalHeight = calcTotalHeight(
      form.numFloors, form.floorHeight,
      form.groundFloorHeight, form.basementCount
    )
    const totalFloorArea = form.buildingLength && form.buildingWidth
      ? calcTotalFloorArea(
          form.buildingLength, form.buildingWidth,
          form.numFloors, form.basementCount
        )
      : undefined

    const payload = {
      projectId,
      ...form,
      totalHeight,
      totalFloorArea: totalFloorArea ?? null,
      updatedAt: serverTimestamp(),
      createdAt: existing.exists()
        ? existing.data().createdAt
        : serverTimestamp(),
    }

    await setDoc(ref, payload)

    // Activity log
    try {
      await setDoc(
        doc(db, 'projects', projectId, 'activity_logs', `building_${Date.now()}`),
        { action: 'building_saved', description: 'ভবনের তথ্য সংরক্ষিত', timestamp: serverTimestamp() }
      )
    } catch (_) { /* non-critical */ }

    const saved = await getBuildingInfo(projectId)
    return { success: true, data: saved! }
  } catch (e: unknown) {
    return { success: false, error: `ভবনের তথ্য সংরক্ষণ করতে সমস্যা: ${e}` }
  }
}
