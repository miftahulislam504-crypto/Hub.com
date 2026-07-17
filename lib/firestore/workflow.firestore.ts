// lib/firestore/workflow.firestore.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllApprovalStatuses } from '@/lib/firestore/approval.firestore'
import { emitEvent } from '@/lib/firestore/event.firestore'
import { ModuleId } from '@/lib/types/dependency.types'
import { WorkflowState, WorkflowStage } from '@/lib/types/workflow.types'

const HUB_MODULES: ModuleId[] = ['siteInfo', 'bnbcSettings', 'buildingInfo']

// ─── Shared existence-check (আগে EcosystemAppsCard.tsx-এর ভেতরে duplicate
// করা ছিল, এখন এখানে centralize — একটাই জায়গা থেকে "app touched project
// data কিনা" চেক হয়) ──────────────────────────────────────────────────────
// checkPath ফরম্যাট: 'collectionName/docId', projects/{projectId}-এর নিচে।
export async function checkAppTouched(
  projectId: string,
  checkPath: string
): Promise<boolean | null> {
  try {
    const [collectionName, docId] = checkPath.split('/')
    const snap = await getDoc(doc(db, 'projects', projectId, collectionName, docId))
    return snap.exists()
  } catch {
    return null   // unknown/error — 'false' এর সাথে গুলিয়ে ফেলা যাবে না
  }
}

// ─── Workflow state derivation ───────────────────────────────────────────────
// এটা কড়াভাবে sequential — প্ল্যানের মূল নিয়ম অনুযায়ী প্রতিটা স্টেজ
// আগেরটার ওপর নির্ভর করে। যেখানে সত্যিকারের সিগন্যাল ফুরিয়ে যায়
// (এখন: PREREQUISITES_READY-এর পরে, কারণ Architecture App এখনো কিছু
// রিপোর্ট করে না), সেখানেই থেমে যায় — এর বেশি claim করে না।
//
// লক্ষ্য করার বিষয়: EcosystemAppsCard-এ Structural-এর জন্য যে
// "touched"/"না" সংকেত দেখানো হয়, সেটা ইচ্ছাকৃতভাবে এই chain-কে
// এগিয়ে নেয় না। কারণ প্ল্যানের নিজের নিয়ম: "Structural Ready" আসার
// আগে "Architecture Approved" হতে হবে। Structural App ছোঁয়া হয়েছে
// কিনা সেটা ভিন্ন, দরকারী তথ্য (debugging/visibility-এর জন্য), কিন্তু
// formal workflow gate-কে override করে না।
export async function deriveWorkflowState(projectId: string): Promise<WorkflowState> {
  const reached: WorkflowState['reachedStages'] = ['PROJECT_CREATED']

  // PREREQUISITES_READY: Hub-এর ৩টা module-ই APPROVED হতে হবে।
  // কেন APPROVED (শুধু "data filled" না)? মূল প্ল্যানের নিজের শেষ নিয়ম:
  // "Approved Data flows through Hub" — শুধু filled data না, approved
  // data-ই downstream-এ যাওয়ার যোগ্য।
  const approvals = await getAllApprovalStatuses(projectId, HUB_MODULES)
  const allApproved = HUB_MODULES.every(m => approvals[m]?.status === 'APPROVED')

  if (!allApproved) {
    const notApproved = HUB_MODULES.filter(m => approvals[m]?.status !== 'APPROVED')
    return {
      currentStage: 'PROJECT_CREATED',
      reachedStages: reached,
      blockedReason: `${notApproved.length} টি Hub module এখনো Approved হয়নি`,
    }
  }

  reached.push('PREREQUISITES_READY')

  // এর পরে যাওয়ার জন্য Architecture App থেকে real approval signal লাগবে —
  // এখনো কোনো contract/SDK নেই (Phase 5/6), তাই honestly এখানেই থামা।
  return {
    currentStage: 'PREREQUISITES_READY',
    reachedStages: reached,
    blockedReason: 'Architecture App এখনো ecosystem-এ যুক্ত হয়নি — কোনো approval signal নেই',
  }
}

// ─── Stage transition tracking (Phase 5 — Event Service) ────────────────────
// `deriveWorkflowState` pure/derived — প্রতিবার fresh হিসাব করে, স্টেট
// রাখে না। কিন্তু event emit করার জন্য জানা দরকার "এটা কি নতুন স্টেজ, নাকি
// আগেও এখানে ছিলাম" — নাহলে UI প্রতিবার load হলেই event log ভরে যাবে।
// তাই একটা ছোট persisted record রাখা হচ্ছে `projects/{projectId}/workflow/state`-এ
// (প্ল্যান section 12-এ আগে থেকেই list করা subcollection, এখন প্রথমবার
// ব্যবহার হলো)।
const workflowStateRef = (projectId: string) =>
  doc(db, 'projects', projectId, 'workflow', 'state')

async function getLastKnownStage(projectId: string): Promise<WorkflowStage | null> {
  const snap = await getDoc(workflowStateRef(projectId))
  if (!snap.exists()) return null
  return (snap.data().lastKnownStage as WorkflowStage) ?? null
}

// UI থেকে এখন থেকে এটা কল হবে (deriveWorkflowState সরাসরি না) — একই কাজ
// করে, প্লাস: স্টেজ সত্যিই বদলালে (এগোনো বা পিছানো, দুটোই) event emit করে
// আর persisted record আপডেট করে।
export async function checkAndEmitStageTransition(projectId: string): Promise<WorkflowState> {
  const state = await deriveWorkflowState(projectId)

  try {
    const lastKnown = await getLastKnownStage(projectId)
    if (lastKnown !== state.currentStage) {
      await emitEvent(projectId, 'WORKFLOW_STAGE_CHANGED', 'hub', {
        fromStage: lastKnown, toStage: state.currentStage,
      })
      await setDoc(workflowStateRef(projectId), {
        lastKnownStage: state.currentStage,
        updatedAt: serverTimestamp(),
      })
    }
  } catch (_) { /* non-critical, tracking best-effort */ }

  return state
}
