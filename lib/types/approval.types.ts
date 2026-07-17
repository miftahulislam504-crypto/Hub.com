// lib/types/approval.types.ts
import { ContractStatus } from './contract.types'
import { ModuleId } from './dependency.types'

// ═══════════════════════════════════════════════════════════════════════════
// APPROVAL SYSTEM — Phase 3
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 9: DRAFT → PROCESSING → READY_FOR_REVIEW → REVIEWED →
// APPROVED → OUTDATED → REJECTED। Status enum টা Phase 1 থেকেই
// contract.types.ts এ ছিল (ContractStatus) — এখানে শুধু re-export করা
// হচ্ছে যাতে approval-সম্পর্কিত কোড এক জায়গা থেকে import করতে পারে।
//
// দুই ধরনের actor থাকতে পারে:
//  - মানুষ: signed-in user (uid/email/displayName Firebase Auth থেকে)
//  - সিস্টেম: dependency cascade-এর কারণে auto-downgrade হলে
//    (dependency.firestore.ts এর bumpModuleVersion থেকে ট্রিগার হয়)
export interface ApprovalActor {
  uid: string
  email: string | null
  displayName: string | null
}

export const SYSTEM_ACTOR: ApprovalActor = {
  uid: 'system',
  email: null,
  displayName: 'সিস্টেম (স্বয়ংক্রিয়)',
}

// `projects/{projectId}/approvals/{moduleId}` — বর্তমান অবস্থা।
export interface ApprovalRecord {
  moduleId: ModuleId
  status: ContractStatus
  approvedVersion: number   // যে version-এ এই status বসানো হয়েছিল
  actedBy: ApprovalActor
  actedAt: string           // ISO
  note?: string
}

// `projects/{projectId}/approvals/{moduleId}/history/{historyId}` — audit trail।
export interface ApprovalHistoryEntry extends ApprovalRecord {
  id: string
}

export type { ContractStatus }
