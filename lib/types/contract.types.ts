// lib/types/contract.types.ts
//
// ═══════════════════════════════════════════════════════════════════════════
// ECOSYSTEM DATA CONTRACT — Phase 1
// ═══════════════════════════════════════════════════════════════════════════
// এইটাই সব App-এর মধ্যে "common engineering language"। কোনো App অন্য App-এর
// internal Firestore structure directly জানবে না — সবাই এই contract দিয়ে
// কথা বলবে।
//
// দুইটা স্তর আছে এই ফাইলে:
//
//  1. ENVELOPE — প্রতিটা contract payload-কে wrap করে (version, source app,
//     schema version, timestamp)। এটা Phase 2 (Version Dependency System)
//     আর Phase 3 (Approval System)-এর ভিত্তি — কিন্তু সেই দুইটার actual
//     mutation-tracking logic এখানে নেই, শুধু shape/type সংজ্ঞায়িত হচ্ছে।
//
//  2. SHARED ENTITIES — ProjectLevel, ProjectGrid, BuildingElementRef।
//     এগুলো এখনো কোনো Hub module produce করে না (Architecture/Structural
//     App এখনো shared model-এ আসেনি — দ্রষ্টব্য README)। এগুলো এখানে আগে
//     থেকেই define করা হচ্ছে যাতে যখন সেই App গুলো যুক্ত হবে, তারা নিজের
//     মতো shape বানানোর বদলে এই contract মেনে চলে। Contract-first, তারপর
//     implementation।
// ═══════════════════════════════════════════════════════════════════════════

export const CONTRACT_SCHEMA_VERSION = '1.0' as const

export type SourceApp =
  | 'hub'
  | 'architectural'
  | 'structural'
  | 'estimating'
  | 'projectmgmt'
  | 'reports'

// ─── Envelope ──────────────────────────────────────────────────────────────
// প্রতিটা module-এর export/exchange payload এই envelope-এ wrap হবে।
// `moduleVersion` এখন সবসময় 1 থাকবে (Phase 1 স্কোপ শুধু shape define করা)।
// Phase 2 এসে এইটা actually increment করবে প্রতিটা update-এ, এবং
// dependency graph বসাবে upstream/downstream version-এর মধ্যে।
export interface ContractEnvelope<T> {
  schemaVersion: typeof CONTRACT_SCHEMA_VERSION
  sourceApp: SourceApp
  projectId: string
  moduleVersion: number          // Phase 2 এ actual tracking শুরু হবে
  generatedAt: string            // ISO date
  data: T
}

export function wrapContract<T>(
  data: T,
  sourceApp: SourceApp,
  projectId: string,
  moduleVersion: number = 1
): ContractEnvelope<T> {
  return {
    schemaVersion: CONTRACT_SCHEMA_VERSION,
    sourceApp,
    projectId,
    moduleVersion,
    generatedAt: new Date().toISOString(),
    data,
  }
}

// ─── Shared Entities (plan section 7 উদাহরণ অনুযায়ী) ───────────────────────
// এগুলো এখনো কোনো producer/consumer নেই Hub-এ। ভবিষ্যতে Architectural App
// যখন shared model-এ আসবে, levels/grids/elements এই shape-এই আসবে।

export interface ProjectLevel {
  id: string
  name: string
  elevation: number   // মিটার, ground level থেকে
  height: number       // মিটার
}

export interface ProjectGrid {
  id: string
  axis: 'X' | 'Y'
  position: number     // মিটার, origin থেকে
}

export interface GeometryData {
  // এখনো generic রাখা হয়েছে — কোন App প্রথমে geometry পাঠাবে (Architectural
  // না Structural) সেটা নিশ্চিত না হওয়া পর্যন্ত এটা lock করা ঠিক হবে না।
  [key: string]: unknown
}

export interface BuildingElementRef {
  id: string
  type: string          // 'wall' | 'door' | 'column' | 'beam' | ...
  levelId: string        // ProjectLevel.id কে refer করে
  geometry?: GeometryData
  materialId?: string
}

// ─── Contract Status (Phase 3 — Approval System-এর জন্য shape এখনই বসানো) ──
// Phase 1 এ শুধু enum/type define হচ্ছে; approve/reject logic, UI, audit
// trail — সব Phase 3 এ।
export type ContractStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'REVIEWED'
  | 'APPROVED'
  | 'OUTDATED'
  | 'REJECTED'
