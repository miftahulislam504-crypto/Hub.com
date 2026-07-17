// lib/types/workflow.types.ts
//
// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW ENGINE — Phase 4
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 2 (Workflow Engine sub-block):
//   Project Created → Architecture Started → Architecture Approved →
//   Structural Ready → Structural Analysis → Structural Design Approved →
//   Estimate Ready → BOQ Approved → Project Management Ready
//
// ⚠️ একটা স্টেজ প্ল্যানে ছিল না, এখানে যোগ করা হয়েছে — স্পষ্টভাবে বলে রাখা হলো:
// `PREREQUISITES_READY`। কারণ: Hub-এর নিজের ৩টা module (Site Info, BNBC,
// Building) আসলে "Architecture Started" না — এগুলো Architecture App-কে যা
// দেওয়া হবে তার raw ingredient (প্ল্যানের section 3 অনুযায়ী: siteData,
// codeSettings, buildingType ইত্যাদি Hub থেকে Architecture App-এ যায়)।
// এই ৩টা module APPROVED হওয়াকে সরাসরি "Architecture Started" বলে চালিয়ে
// দেওয়াটা মিথ্যা claim হতো। তাই একটা সৎ, আলাদা intermediate স্টেজ যোগ করা
// হয়েছে যেটা বলে: "Hub-এর নিজের অংশ শেষ, হস্তান্তরের জন্য প্রস্তুত" — এর
// বেশি কিছু দাবি করে না।
export type WorkflowStage =
  | 'PROJECT_CREATED'
  | 'PREREQUISITES_READY'          // ⚠️ Hub-এর সংযোজন, প্ল্যানে ছিল না
  | 'ARCHITECTURE_STARTED'
  | 'ARCHITECTURE_APPROVED'
  | 'STRUCTURAL_READY'
  | 'STRUCTURAL_ANALYSIS'
  | 'STRUCTURAL_DESIGN_APPROVED'
  | 'ESTIMATE_READY'
  | 'BOQ_APPROVED'
  | 'PROJECT_MANAGEMENT_READY'

export const WORKFLOW_STAGE_ORDER: WorkflowStage[] = [
  'PROJECT_CREATED',
  'PREREQUISITES_READY',
  'ARCHITECTURE_STARTED',
  'ARCHITECTURE_APPROVED',
  'STRUCTURAL_READY',
  'STRUCTURAL_ANALYSIS',
  'STRUCTURAL_DESIGN_APPROVED',
  'ESTIMATE_READY',
  'BOQ_APPROVED',
  'PROJECT_MANAGEMENT_READY',
]

export const WORKFLOW_STAGE_LABELS_BN: Record<WorkflowStage, string> = {
  PROJECT_CREATED:             'প্রজেক্ট তৈরি হয়েছে',
  PREREQUISITES_READY:         'Hub ডেটা প্রস্তুত (হস্তান্তরের জন্য)',
  ARCHITECTURE_STARTED:        'Architecture শুরু হয়েছে',
  ARCHITECTURE_APPROVED:       'Architecture অনুমোদিত',
  STRUCTURAL_READY:            'Structural কাজের জন্য প্রস্তুত',
  STRUCTURAL_ANALYSIS:         'Structural Analysis চলছে',
  STRUCTURAL_DESIGN_APPROVED:  'Structural Design অনুমোদিত',
  ESTIMATE_READY:              'Estimate-এর জন্য প্রস্তুত',
  BOQ_APPROVED:                'BOQ অনুমোদিত',
  PROJECT_MANAGEMENT_READY:    'Project Management-এর জন্য প্রস্তুত',
}

export interface WorkflowState {
  currentStage: WorkflowStage
  reachedStages: WorkflowStage[]   // currentStage পর্যন্ত সব স্টেজ, ক্রম অনুযায়ী
  blockedReason?: string           // পরের স্টেজে কেন যেতে পারছে না, মানুষের পড়ার মতো ব্যাখ্যা
}

// ─── App Registry — এখন পর্যন্ত যে একমাত্র real existence-check সিগন্যাল
// আছে (Structural, structuralData/civp)। বাকি App গুলোর কোনো checkPath নেই —
// EcosystemAppsCard.tsx এটাই ব্যবহার করে, এখানে centralize করা হলো যাতে
// WorkflowProgressCard.tsx-ও একই সিগন্যাল থেকে পড়তে পারে, ডুপ্লিকেট না
// করে।
export const APP_CHECK_PATHS: Partial<Record<
  'architectural' | 'structural' | 'estimating' | 'projectmgmt' | 'reports',
  string
>> = {
  structural: 'structuralData/civp',
  // architectural, estimating, projectmgmt, reports — এখনো কোনো
  // checkPath নেই। ভুল path guess করে "not started" দেখানো আসল "কোনো
  // সংকেত নেই" অবস্থার চেয়ে খারাপ (mislead করে), তাই খালি রাখা হয়েছে।
}
