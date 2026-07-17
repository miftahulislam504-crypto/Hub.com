// lib/firestore/dependency.firestore.ts
import {
  doc, getDoc, setDoc, collection, getDocs, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  ModuleId, ModuleVersionRecord, ModuleDependency, DependencyStatus,
  getDependencyStatus,
} from '@/lib/types/dependency.types'
import { downgradeToOutdatedIfApproved, getApprovalStatus } from '@/lib/firestore/approval.firestore'
import { emitEvent } from '@/lib/firestore/event.firestore'

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  return new Date().toISOString()
}

const versionRef = (projectId: string, moduleId: ModuleId) =>
  doc(db, 'projects', projectId, 'versions', moduleId)

// ─── Version tracking ───────────────────────────────────────────────────────

// প্রতিটা save-এর সময় *.firestore.ts থেকে এটা কল হবে। নতুন module হলে
// version 1 থেকে শুরু হয়, নাহলে +1।
export async function bumpModuleVersion(
  projectId: string,
  moduleId: ModuleId
): Promise<number> {
  const ref = versionRef(projectId, moduleId)
  const snap = await getDoc(ref)
  const nextVersion = snap.exists() ? (snap.data().currentVersion ?? 1) + 1 : 1

  await setDoc(ref, {
    moduleId,
    currentVersion: nextVersion,
    updatedAt: serverTimestamp(),
  })

  // Event Service (Phase 5) — real trigger, real emit
  try {
    await emitEvent(projectId, 'MODULE_VERSION_BUMPED', 'hub', { moduleId, newVersion: nextVersion })
  } catch (_) { /* non-critical */ }

  // ── Approval cascade (Phase 3) ──────────────────────────────────────────
  // দুটো নিয়ম, দুটোই best-effort — কোনোটা fail করলেও version bump টা
  // ইতিমধ্যে persist হয়ে গেছে, তাই এখানে try/catch দিয়ে wrap করা হয়েছে।
  try {
    // ১. নিজের version বদলালে নিজের APPROVED status আর সঠিক থাকে না —
    //    approved content-এর সাথে এখন actual content মেলে না।
    await downgradeToOutdatedIfApproved(
      projectId, moduleId,
      `${moduleId} সম্পাদনা করার ফলে v${nextVersion} এ পরিবর্তিত হয়েছে — পুনরায় review প্রয়োজন`
    )

    // ২. এই module-এর ওপর যারা নির্ভরশীল, তাদের জন্য dependency status
    //    এখন OUTDATED কিনা চেক করে — যদি হয় এবং তাদের approval আগে
    //    APPROVED ছিল, সেটাও downgrade করা হয়।
    const dependents = (await getProjectDependencies(projectId))
      .filter(d => d.upstreamModule === moduleId)

    for (const dep of dependents) {
      const status = getDependencyStatus(dep, nextVersion)
      if (status === 'OUTDATED') {
        await downgradeToOutdatedIfApproved(
          projectId, dep.dependentModule,
          `উৎস "${moduleId}" এখন v${nextVersion} — এই module পুরনো v${dep.upstreamVersionAtLink} দেখে approve হয়েছিল`
        )
      }
    }
  } catch (_) { /* non-critical, approval cascade best-effort */ }

  return nextVersion
}

export async function getModuleVersion(
  projectId: string,
  moduleId: ModuleId
): Promise<ModuleVersionRecord | null> {
  const snap = await getDoc(versionRef(projectId, moduleId))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    moduleId,
    currentVersion: d.currentVersion ?? 1,
    updatedAt: toISO(d.updatedAt),
  }
}

export async function getAllModuleVersions(
  projectId: string
): Promise<ModuleVersionRecord[]> {
  const snaps = await getDocs(collection(db, 'projects', projectId, 'versions'))
  return snaps.docs.map(s => {
    const d = s.data()
    return {
      moduleId: s.id as ModuleId,
      currentVersion: d.currentVersion ?? 1,
      updatedAt: toISO(d.updatedAt),
    }
  })
}

// ─── Dependencies ────────────────────────────────────────────────────────────

const dependencyRef = (projectId: string, dependencyId: string) =>
  doc(db, 'projects', projectId, 'dependencies', dependencyId)

// dependent module upstream module-এর যে version দেখেছে সেটা record করে।
// একই dependent→upstream pair-এর জন্য id deterministic রাখা হয়েছে যাতে
// re-linking পুরনো record overwrite করে, ডুপ্লিকেট তৈরি না করে।
export async function linkDependency(
  projectId: string,
  dependentModule: ModuleId,
  upstreamModule: ModuleId,
  upstreamVersionAtLink: number,
  reason: string
): Promise<ModuleDependency> {
  const id = `${dependentModule}__depends_on__${upstreamModule}`
  const ref = dependencyRef(projectId, id)

  const payload = {
    projectId,
    dependentModule,
    upstreamModule,
    upstreamVersionAtLink,
    reason,
    createdAt: serverTimestamp(),
  }
  await setDoc(ref, payload)

  // Event Service (Phase 5)
  try {
    await emitEvent(projectId, 'MODULE_DEPENDENCY_LINKED', 'hub', {
      dependentModule, upstreamModule, upstreamVersionAtLink,
    })
  } catch (_) { /* non-critical */ }

  return { id, projectId, dependentModule, upstreamModule, upstreamVersionAtLink, reason, createdAt: new Date().toISOString() }
}

export async function getProjectDependencies(
  projectId: string
): Promise<ModuleDependency[]> {
  const snaps = await getDocs(collection(db, 'projects', projectId, 'dependencies'))
  return snaps.docs.map(s => {
    const d = s.data()
    return {
      id: s.id,
      projectId,
      dependentModule: d.dependentModule,
      upstreamModule: d.upstreamModule,
      upstreamVersionAtLink: d.upstreamVersionAtLink ?? 1,
      reason: d.reason ?? '',
      createdAt: toISO(d.createdAt),
    }
  })
}

// একটা project-এর সব dependency-র বর্তমান status একবারে বের করা —
// প্রতিটার জন্য upstream-এর current version লাগবে, তাই version আর
// dependency দুটো collection-ই পড়তে হয়।
export interface DependencyWithStatus extends ModuleDependency {
  status: DependencyStatus
  upstreamCurrentVersion: number
}

export async function getProjectDependencyStatuses(
  projectId: string
): Promise<DependencyWithStatus[]> {
  const [dependencies, versions] = await Promise.all([
    getProjectDependencies(projectId),
    getAllModuleVersions(projectId),
  ])

  const versionMap = new Map(versions.map(v => [v.moduleId, v.currentVersion]))

  return dependencies.map(dep => {
    const upstreamCurrentVersion = versionMap.get(dep.upstreamModule) ?? dep.upstreamVersionAtLink
    return {
      ...dep,
      upstreamCurrentVersion,
      status: getDependencyStatus(dep, upstreamCurrentVersion),
    }
  })
}

// ─── Stage lock check (informational — প্ল্যান section 2 এর "Architectural
// Model Not Approved" ধরনের মেসেজ) ─────────────────────────────────────────
// এই function সত্যিকারের check করে, কিন্তু কোনো UI বর্তমানে এটা দিয়ে form/tab
// hard-lock করে না — শুধু একটা তথ্যমূলক নোট দেখানোর জন্য ব্যবহার হয় (দেখুন
// components/integration/ApprovalCard.tsx)। ভবিষ্যতে যখন সত্যিকারের multi-app,
// multi-person workflow আসবে (Phase 4+), তখন এটা দিয়ে আসল gate বসানো যাবে।
export interface UnlockStatus {
  unlocked: boolean
  blockedBy: ModuleId[]   // যেসব upstream module এখনো APPROVED না
}

export async function isModuleUnlocked(
  projectId: string,
  moduleId: ModuleId
): Promise<UnlockStatus> {
  const upstreamDeps = (await getProjectDependencies(projectId))
    .filter(d => d.dependentModule === moduleId)

  if (upstreamDeps.length === 0) return { unlocked: true, blockedBy: [] }

  const blockedBy: ModuleId[] = []
  for (const dep of upstreamDeps) {
    const approval = await getApprovalStatus(projectId, dep.upstreamModule)
    if (!approval || approval.status !== 'APPROVED') {
      blockedBy.push(dep.upstreamModule)
    }
  }

  return { unlocked: blockedBy.length === 0, blockedBy }
}
