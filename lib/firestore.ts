// lib/firestore.ts
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { Project, ServiceResult } from './types'
import { generateProjectCode } from './utils'

const COL_PROJECTS = 'projects'
const SUB_ACTIVITY = 'activity_logs'

// --- Helpers ---
function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate()
  if (val instanceof Date) return val
  return new Date()
}

function docToProject(id: string, d: Record<string, unknown>): Project {
  return {
    id,
    projectCode:  String(d.projectCode  ?? ''),
    projectName:  String(d.projectName  ?? ''),
    clientName:   String(d.clientName   ?? ''),
    location:     String(d.location     ?? ''),
    status:       (d.status as Project['status']) ?? 'active',
    startDate:    toDate(d.startDate),
    endDate:      d.endDate ? toDate(d.endDate) : undefined,
    description:  d.description ? String(d.description) : undefined,
    createdBy:    String(d.createdBy ?? ''),
    createdAt:    toDate(d.createdAt),
    updatedAt:    d.updatedAt ? toDate(d.updatedAt) : undefined,
  }
}

// --- Activity Log ---
async function logActivity(projectId: string, action: string, description: string) {
  try {
    await addDoc(collection(db, COL_PROJECTS, projectId, SUB_ACTIVITY), {
      action, description,
      timestamp: serverTimestamp(),
    })
  } catch (_) { /* non-critical */ }
}

// --- Projects CRUD ---

export async function getProjects(uid: string): Promise<Project[]> {
  const q = query(
    collection(db, COL_PROJECTS),
    where('createdBy', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => docToProject(d.id, d.data() as Record<string, unknown>))
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, COL_PROJECTS, id))
  if (!snap.exists()) return null
  return docToProject(snap.id, snap.data() as Record<string, unknown>)
}

export async function createProject(
  uid: string,
  data: {
    projectName: string
    clientName: string
    location: string
    startDate: Date
    endDate?: Date
    description?: string
  }
): Promise<ServiceResult<Project>> {
  try {
    const ref = await addDoc(collection(db, COL_PROJECTS), {
      projectCode:  generateProjectCode(),
      projectName:  data.projectName,
      clientName:   data.clientName,
      location:     data.location,
      status:       'active',
      startDate:    Timestamp.fromDate(data.startDate),
      endDate:      data.endDate ? Timestamp.fromDate(data.endDate) : null,
      description:  data.description ?? null,
      createdBy:    uid,
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    })
    await logActivity(ref.id, 'project_created', `প্রজেক্ট তৈরি: ${data.projectName}`)
    const created = await getProject(ref.id)
    return { success: true, data: created! }
  } catch (e: unknown) {
    return { success: false, error: String(e) }
  }
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'createdBy' | 'createdAt'>>
): Promise<ServiceResult<void>> {
  try {
    const payload: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() }
    if (data.startDate) payload.startDate = Timestamp.fromDate(data.startDate)
    if (data.endDate)   payload.endDate   = Timestamp.fromDate(data.endDate)
    await updateDoc(doc(db, COL_PROJECTS, id), payload)
    await logActivity(id, 'project_updated', 'প্রজেক্ট আপডেট করা হয়েছে')
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: String(e) }
  }
}

export async function updateProjectStatus(
  id: string, status: Project['status']
): Promise<ServiceResult<void>> {
  return updateProject(id, { status })
}

export async function deleteProject(id: string): Promise<ServiceResult<void>> {
  try {
    const subCols = ['site_information', 'bnbc_settings', 'building_information', 'documents', 'activity_logs']
    for (const sub of subCols) {
      const snap = await getDocs(collection(db, COL_PROJECTS, id, sub))
      for (const d of snap.docs) await deleteDoc(d.ref)
    }
    await deleteDoc(doc(db, COL_PROJECTS, id))
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: String(e) }
  }
}
