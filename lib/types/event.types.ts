// lib/types/event.types.ts
import { SourceApp } from './contract.types'

// ═══════════════════════════════════════════════════════════════════════════
// EVENT SERVICE — Phase 5
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 3,4,5,6-এ প্রতিটা App-এর নিজস্ব event list ছিল — সেগুলো
// হুবহু নিচে আছে। এই মুহূর্তে এই ১৯টার একটাও real emit হয় না, কারণ
// Architectural/Structural/Estimating/PM App গুলো এখনো Hub-এর shared
// model-এ যুক্ত হয়নি (কোনো contract/SDK নেই — Phase 6 বাকি)। এগুলো এখন
// শুধু type হিসেবে define করা হলো, যাতে সেই App গুলো যখন আসবে, নাম নিয়ে
// অনুমান করতে না হয়।
//
// যেগুলো *সত্যিই* এখন emit হয় (Hub-এর নিজের ৩টা module-এর real state
// change থেকে) — সেগুলো "Hub internal" ব্লকে, উপরে।
export type HubEventType =
  // ── Hub internal (Phase 2/3/4-এর real trigger থেকে, প্ল্যানে নাম ছিল না) ──
  | 'MODULE_VERSION_BUMPED'
  | 'MODULE_DEPENDENCY_LINKED'
  | 'MODULE_APPROVED'
  | 'MODULE_REJECTED'
  | 'MODULE_OUTDATED'
  | 'MODULE_STATUS_CHANGED'      // DRAFT/PROCESSING/READY_FOR_REVIEW/REVIEWED — catch-all
  | 'WORKFLOW_STAGE_CHANGED'     // এগোনো বা পিছানো দুটোই, payload-এ fromStage/toStage থাকে
  | 'REPORT_GENERATED'           // Phase 7 — report registry-তে নতুন/পুনর্জেনারেট হয়েছে

  // ── Architectural (section 3) — এখনো কোনো emitter নেই ──
  | 'ARCH_MODEL_UPDATED'
  | 'ARCH_MODEL_VALIDATED'
  | 'ARCH_MODEL_APPROVED'

  // ── Structural (section 4) — এখনো কোনো emitter নেই ──
  | 'STRUCT_MODEL_CREATED'
  | 'ANALYSIS_COMPLETED'
  | 'DESIGN_COMPLETED'
  | 'FOUNDATION_COMPLETED'
  | 'STRUCT_DESIGN_APPROVED'

  // ── Estimating (section 5) — এখনো কোনো emitter নেই ──
  | 'QUANTITY_CALCULATED'
  | 'BOQ_GENERATED'
  | 'COST_CALCULATED'
  | 'ESTIMATE_UPDATED'
  | 'ESTIMATE_APPROVED'

  // ── Project Management (section 6) — এখনো কোনো emitter নেই ──
  | 'PROJECT_STARTED'
  | 'PROGRESS_UPDATED'
  | 'COST_UPDATED'
  | 'DELAY_DETECTED'
  | 'MILESTONE_COMPLETED'
  | 'PROJECT_COMPLETED'

// `projects/{projectId}/events/{eventId}` — প্ল্যানের section 12
// (Firestore Master Structure)-এ আগে থেকেই list করা subcollection।
export interface HubEvent {
  id: string
  projectId: string
  type: HubEventType
  sourceApp: SourceApp
  payload?: Record<string, unknown>
  createdAt: string   // ISO
}

// UI-তে দেখানোর জন্য মানুষ-পঠনযোগ্য বাংলা লেবেল — শুধু এখন যেগুলো সত্যিই
// emit হয় তার জন্য। বাকিগুলো (plan-defined, no emitter) দরকার হলে পরে
// যোগ হবে।
export const EVENT_LABELS_BN: Partial<Record<HubEventType, string>> = {
  MODULE_VERSION_BUMPED:     'সংস্করণ আপডেট হয়েছে',
  MODULE_DEPENDENCY_LINKED:  'নির্ভরতা লিংক করা হয়েছে',
  MODULE_APPROVED:           'অনুমোদিত হয়েছে',
  MODULE_REJECTED:           'প্রত্যাখ্যাত হয়েছে',
  MODULE_OUTDATED:           'পুরনো হয়ে গেছে (স্বয়ংক্রিয়)',
  MODULE_STATUS_CHANGED:     'অবস্থা পরিবর্তিত হয়েছে',
  WORKFLOW_STAGE_CHANGED:    'Workflow স্টেজ পরিবর্তিত হয়েছে',
  REPORT_GENERATED:          'রিপোর্ট তৈরি হয়েছে',
}
