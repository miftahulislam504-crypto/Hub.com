// lib/firestore/approval.firestore.ts
import {
  doc, getDoc, setDoc, collection, getDocs, query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ModuleId } from '@/lib/types/dependency.types'
import {
  ApprovalRecord, ApprovalHistoryEntry, ApprovalActor, ContractStatus, SYSTEM_ACTOR,
} from '@/lib/types/approval.types'
import { emitEvent } from '@/lib/firestore/event.firestore'
import { HubEventType } from '@/lib/types/event.types'

// এই ফাইল dependency.firestore.ts থেকে কিছু import করে না — dependency.firestore.ts
// এই ফাইল থেকে import করবে (cascade downgrade-এর জন্য), তাই এই দিকটা ঠিক রাখা
// জরুরি circular import এড়াতে।

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  return new Date().toISOString()
}

const approvalRef = (projectId: string, moduleId: ModuleId) =>
  doc(db, 'projects', projectId, 'approvals', moduleId)

function toRecord(moduleId: ModuleId, d: Record<string, unknown>): ApprovalRecord {
  return {
    moduleId,
    status: (d.status as ContractStatus) ?? 'DRAFT',
    approvedVersion: (d.approvedVersion as number) ?? 0,
    actedBy: d.actedBy as ApprovalActor,
    actedAt: toISO(d.actedAt),
    note: d.note as string | undefined,
  }
}

// ─── Current status ──────────────────────────────────────────────────────────

export async function getApprovalStatus(
  projectId: string,
  moduleId: ModuleId
): Promise<ApprovalRecord | null> {
  const snap = await getDoc(approvalRef(projectId, moduleId))
  if (!snap.exists()) return null
  return toRecord(moduleId, snap.data())
}

export async function getAllApprovalStatuses(
  projectId: string,
  moduleIds: ModuleId[]
): Promise<Record<string, ApprovalRecord | null>> {
  const entries = await Promise.all(
    moduleIds.map(async id => [id, await getApprovalStatus(projectId, id)] as const)
  )
  return Object.fromEntries(entries)
}

// একজন মানুষ Review/Approve/Reject বাটনে ক্লিক করলে এটা কল হবে।
// current module version (dependency.firestore.ts এর getModuleVersion থেকে)
// caller-কে দিতে হবে, যাতে approvedVersion সঠিক থাকে।
export async function setApprovalStatus(
  projectId: string,
  moduleId: ModuleId,
  status: ContractStatus,
  moduleVersion: number,
  actor: ApprovalActor,
  note?: string
): Promise<void> {
  const record = {
    moduleId,
    status,
    approvedVersion: moduleVersion,
    actedBy: actor,
    actedAt: serverTimestamp(),
    ...(note ? { note } : {}),
  }

  await setDoc(approvalRef(projectId, moduleId), record)

  // Audit trail — history/{historyId}, append-only
  await setDoc(
    doc(db, 'projects', projectId, 'approvals', moduleId, 'history', `hist_${Date.now()}`),
    record
  )

  // Event Service (Phase 5) — একটাই emit পয়েন্ট, তাই মানুষের ক্লিক আর
  // system cascade (downgradeToOutdatedIfApproved নিচে) দুটোই স্বয়ংক্রিয়ভাবে
  // cover হয়ে যায়, আলাদা করে emit call ছড়িয়ে দিতে হয় না।
  try {
    const eventType: HubEventType =
      status === 'APPROVED' ? 'MODULE_APPROVED' :
      status === 'REJECTED' ? 'MODULE_REJECTED' :
      status === 'OUTDATED' ? 'MODULE_OUTDATED' :
      'MODULE_STATUS_CHANGED'
    await emitEvent(projectId, eventType, 'hub', { moduleId, status, moduleVersion, note })
  } catch (_) { /* non-critical */ }
}

// dependency.firestore.ts এর bumpModuleVersion cascade এখান থেকে এটা কল করে।
// শুধু তখনই downgrade করে যখন module বর্তমানে সত্যিই APPROVED — DRAFT বা
// REVIEWED অবস্থায় থাকলে touch করার দরকার নেই, invalidate করার মতো কিছু নেই।
export async function downgradeToOutdatedIfApproved(
  projectId: string,
  moduleId: ModuleId,
  reason: string
): Promise<void> {
  const current = await getApprovalStatus(projectId, moduleId)
  if (!current || current.status !== 'APPROVED') return

  await setApprovalStatus(
    projectId,
    moduleId,
    'OUTDATED',
    current.approvedVersion,   // পুরনো approved version-ই থাকে, নতুন approve না হওয়া পর্যন্ত
    SYSTEM_ACTOR,
    reason
  )
}

// ─── Audit trail ─────────────────────────────────────────────────────────────

export async function getApprovalHistory(
  projectId: string,
  moduleId: ModuleId
): Promise<ApprovalHistoryEntry[]> {
  const snaps = await getDocs(
    query(
      collection(db, 'projects', projectId, 'approvals', moduleId, 'history'),
      orderBy('actedAt', 'desc')
    )
  )
  return snaps.docs.map(s => ({ id: s.id, ...toRecord(moduleId, s.data()) }))
}
