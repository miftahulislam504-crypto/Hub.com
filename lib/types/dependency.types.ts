// lib/types/dependency.types.ts
//
// ═══════════════════════════════════════════════════════════════════════════
// VERSION DEPENDENCY SYSTEM — Phase 2
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 8: "Architecture V1.1 হলে Structural V1.0 OUTDATED হবে"
// ধরনের dependency tracking। এখানে দুইটা স্তর আছে:
//
//  1. VERSION — প্রতিটা module-এর নিজস্ব version number (এখন যা আছে:
//     siteInfo, bnbcSettings, buildingInfo)। Save হওয়ার সময় auto-increment
//     হবে (lib/firestore/*.firestore.ts এ বসানো হয়েছে)।
//
//  2. DEPENDENCY — কোন module কোন module-এর কোন version-এর ওপর ভিত্তি করে
//     তৈরি হয়েছে, সেটা track করা। এখন Hub-এর ৩টা module (siteInfo,
//     bnbcSettings, buildingInfo) নিজেদের মধ্যে সিকোয়েনশিয়াল pipeline না
//     (এরা project সম্পর্কে independent facts, একে অন্যের output না) —
//     তাই এখানে fake dependency বসানো হয়নি। যে একটা GENUINE link কোডে
//     আগে থেকেই ছিল (bnbc.types.ts কমেন্ট: "soilType (linked from Site
//     Info)") সেটাই এখানে প্রথম dependency হিসেবে wire করা হয়েছে।
//
//     বাকি dependency edge গুলো (Architecture→Structural→Estimate→PM)
//     তখনই বসবে যখন সেই App গুলো shared model-এ যুক্ত হবে (Phase 5/6)।
// ═══════════════════════════════════════════════════════════════════════════

// এখন পর্যন্ত যে module গুলোর ভার্সন ট্র্যাক করা হয় (Hub-এর নিজের ৩টা +
// ভবিষ্যতের ecosystem app গুলো)।
export type ModuleId =
  | 'siteInfo'
  | 'bnbcSettings'
  | 'buildingInfo'
  | 'architectural'
  | 'structural'
  | 'estimating'
  | 'projectmgmt'

// UI-তে দেখানোর জন্য মানুষ-পঠনযোগ্য নাম — DependencyStatusCard আর
// ApprovalCard দুটোই এখান থেকে import করে, যাতে দুই জায়গায় আলাদা করে না
// লিখতে হয়।
export const MODULE_LABELS: Record<ModuleId, string> = {
  siteInfo:      'সাইট ইনফরমেশন',
  bnbcSettings:  'BNBC সেটিংস',
  buildingInfo:  'ভবনের তথ্য',
  architectural: 'Architectural',
  structural:    'Structural',
  estimating:    'Estimating',
  projectmgmt:   'Project Management',
}

// `projects/{projectId}/versions/{moduleId}` — একটা doc প্রতি module।
export interface ModuleVersionRecord {
  moduleId: ModuleId
  currentVersion: number
  updatedAt: string   // ISO
}

// `projects/{projectId}/dependencies/{dependencyId}`
// একটা dependency edge: dependentModule নির্ভর করে upstreamModule-এর ওপর।
export interface ModuleDependency {
  id: string
  projectId: string
  dependentModule: ModuleId
  upstreamModule: ModuleId
  upstreamVersionAtLink: number   // যে version দেখে dependent module তৈরি/আপডেট হয়েছিল
  reason: string                   // মানুষের পড়ার মতো: কেন এই dependency আছে
  createdAt: string
}

export type DependencyStatus = 'CURRENT' | 'OUTDATED'

// upstream-এর বর্তমান version আর dependency তৈরির সময়ের version মিলিয়ে
// status বের করা। এটাই Phase 2-এর মূল চেক — Phase 3 (Approval) এসে এর
// ওপর ভিত্তি করে APPROVED স্ট্যাটাসকে OUTDATED-এ রিসেট করবে।
export function getDependencyStatus(
  dependency: ModuleDependency,
  upstreamCurrentVersion: number
): DependencyStatus {
  return upstreamCurrentVersion > dependency.upstreamVersionAtLink
    ? 'OUTDATED'
    : 'CURRENT'
}
