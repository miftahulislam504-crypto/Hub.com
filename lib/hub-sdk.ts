// lib/hub-sdk.ts
//
// ═══════════════════════════════════════════════════════════════════════════
// HUB SDK / APP GATEWAY — Phase 6
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 13:
//   hub.openProject(projectId)
//   hub.getApprovedArchitecture()
//   hub.publishStructuralModel()
//   hub.emitEvent()
//   hub.registerReport()
//   hub.getProjectDependencies()
// "এর ফলে চারটা app-এ আলাদা আলাদা Firebase logic লিখতে হবে না।"
//
// ⚠️ সৎভাবে বলে রাখা দরকার — এই SDK এখন পর্যন্ত **শুধু Hub-এর নিজের কোডে**
// ব্যবহৃত হচ্ছে (এই zip-এর ৫টা integration UI component)। Architectural/
// Structural/Estimating/PM App গুলো আলাদা codebase/deployment, এই zip-এ
// নেই — তাই তারা *এখনো* এই SDK import করতে পারছে না। যখন সেই App গুলো
// নিয়ে কাজ হবে (আলাদা zip আপলোড করে), এই একই ফাইল সেখানে কপি করে বসানো
// যাবে এবং raw Firestore path-এর বদলে `hub.xxx()` কল বসানো যাবে।
//
// এই ফাইল কোনো নতুন লজিক লেখে না — Phase 1-5-এ যা বানানো হয়েছে
// (dependency.firestore.ts, approval.firestore.ts, workflow.firestore.ts,
// event.firestore.ts, lib/firestore.ts) সেগুলোর ওপর একটা পাতলা, curated
// wrapper। ওই ফাইলগুলো অপরিবর্তিত রাখা হয়েছে — এই SDK ভাঙলেও mechanism
// নিজে সুরক্ষিত থাকে, রোলব্যাক সহজ।
//
// hub.getApprovedArchitecture() এর মতো নাম যেগুলো প্ল্যানে specific ছিল,
// সেগুলো generic getApprovedModule()-এর thin wrapper — কারণ এখনো
// "architecture data" বলে আলাদা কিছু নেই, শুধু generic module tracking
// আছে (siteInfo/bnbcSettings/buildingInfo + ভবিষ্যতের architectural/
// structural/estimating/projectmgmt একই mechanism শেয়ার করে)।
// ═══════════════════════════════════════════════════════════════════════════

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getProject } from '@/lib/firestore'
import { SourceApp } from '@/lib/types/contract.types'
import { ModuleId } from '@/lib/types/dependency.types'

import {
  bumpModuleVersion, getModuleVersion, getAllModuleVersions,
  linkDependency, getProjectDependencies as _getProjectDependencies,
  getProjectDependencyStatuses, isModuleUnlocked,
} from '@/lib/firestore/dependency.firestore'

import {
  getApprovalStatus, getAllApprovalStatuses, setApprovalStatus, getApprovalHistory,
} from '@/lib/firestore/approval.firestore'

import {
  checkAndEmitStageTransition, checkAppTouched,
} from '@/lib/firestore/workflow.firestore'

import {
  emitEvent, getProjectEvents, subscribeToEvents, subscribeToAppTouched,
} from '@/lib/firestore/event.firestore'

import {
  registerReport, getProjectReports,
  generateSiteInfoSummary, generateBnbcParametersReport, generateBuildingInfoSummary,
} from '@/lib/firestore/report.firestore'

import { uploadModuleData, getModuleDataFile } from '@/lib/firestore/module-data.firestore'

// ─── Project ──────────────────────────────────────────────────────────────
async function openProject(projectId: string) {
  return getProject(projectId)
}

// ─── Approved data retrieval (plan: hub.getApprovedArchitecture()) ──────────
async function getApprovedModule(projectId: string, moduleId: ModuleId) {
  const [approval, version] = await Promise.all([
    getApprovalStatus(projectId, moduleId),
    getModuleVersion(projectId, moduleId),
  ])
  if (!approval || approval.status !== 'APPROVED') return null
  return { approval, currentVersion: version?.currentVersion ?? approval.approvedVersion }
}

// প্ল্যানের literal নাম, generic getApprovedModule-এর thin wrapper।
const getApprovedArchitecture = (projectId: string) => getApprovedModule(projectId, 'architectural')
const getApprovedStructural    = (projectId: string) => getApprovedModule(projectId, 'structural')

// ─── Publishing (plan: hub.publishStructuralModel()) ────────────────────────
// Hub ভারী engineering data (geometry/mesh/analysis result) নিজে সংরক্ষণ
// করে না (প্ল্যান section 12 — সেসব Storage-এ থাকার কথা)। এখানে শুধু
// version bump + ছোট metadata reference (storagePath ইত্যাদি) রাখা হয়।
interface PublishMetadata {
  storagePath?: string
  summary?: string
  [key: string]: unknown
}

async function publishModule(
  projectId: string,
  moduleId: ModuleId,
  sourceApp: SourceApp,
  metadata?: PublishMetadata
): Promise<{ newVersion: number }> {
  const newVersion = await bumpModuleVersion(projectId, moduleId)   // cascade + event, Phase 2/3/5 থেকে

  if (metadata) {
    await setDoc(doc(db, 'projects', projectId, 'moduleMetadata', moduleId), {
      ...metadata, version: newVersion, sourceApp, updatedAt: serverTimestamp(),
    })
  }

  return { newVersion }
}

// প্ল্যানের literal নাম, generic publishModule-এর thin wrapper।
const publishStructuralModel = (projectId: string, metadata?: PublishMetadata) =>
  publishModule(projectId, 'structural', 'structural', metadata)

// ─── registerReport() — Phase 7-এ বাস্তবায়িত ────────────────────────────────
// প্ল্যানের section 10 (Report Center)। Registry mechanism সম্পূর্ণ, কিন্তু
// generate করার real content শুধু Hub-এর নিজের ৩টা module-এর জন্য আছে —
// Architectural/Structural/Estimating/PM-এর ১৫টা report type এখনো শুধু
// vocabulary (lib/types/report.types.ts), generator নেই, কারণ কোনো source
// data নেই। দেখুন PHASE7_NOTES.md।

// ─── SDK surface ─────────────────────────────────────────────────────────────
export const hub = {
  // Project
  openProject,

  // Approved data
  getApprovedModule,
  getApprovedArchitecture,
  getApprovedStructural,

  // Publishing
  publishModule,
  publishStructuralModel,

  // Events (Phase 5)
  emitEvent,
  getEvents: getProjectEvents,
  subscribeToEvents,
  subscribeToAppTouched,
  checkAppTouched,

  // Dependencies (Phase 2)
  getProjectDependencies: _getProjectDependencies,
  getProjectDependencyStatuses,
  linkDependency,
  isModuleUnlocked,
  getModuleVersion,
  getAllModuleVersions,

  // Approval (Phase 3)
  getApprovalStatus,
  getAllApprovalStatuses,
  setApprovalStatus,
  getApprovalHistory,

  // Workflow (Phase 4)
  getWorkflowState: checkAndEmitStageTransition,

  // Reports (Phase 7)
  registerReport,
  getProjectReports,
  generateSiteInfoSummary,
  generateBnbcParametersReport,
  generateBuildingInfoSummary,

  // Heavy data → Storage (Phase 9)
  uploadModuleData,
  getModuleDataFile,
}

export type HubSDK = typeof hub
