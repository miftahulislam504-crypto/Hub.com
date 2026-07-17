// lib/firestore/event.firestore.ts
import {
  doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit,
  onSnapshot, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { HubEvent, HubEventType } from '@/lib/types/event.types'
import { SourceApp } from '@/lib/types/contract.types'

// এই ফাইল dependency.firestore.ts, approval.firestore.ts, বা
// workflow.firestore.ts — কোনোটা থেকেই import করে না। ওই তিনটা ফাইল এখন
// এই ফাইল থেকে import করবে (emit করার জন্য), তাই এই দিকটা clean রাখা
// circular import এড়ানোর জন্য জরুরি।

function toISO(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString()
  return new Date().toISOString()
}

function toEvent(id: string, d: Record<string, unknown>): HubEvent {
  return {
    id,
    projectId: d.projectId as string,
    type: d.type as HubEventType,
    sourceApp: d.sourceApp as SourceApp,
    payload: d.payload as Record<string, unknown> | undefined,
    createdAt: toISO(d.createdAt),
  }
}

// ─── Emit ─────────────────────────────────────────────────────────────────
export async function emitEvent(
  projectId: string,
  type: HubEventType,
  sourceApp: SourceApp,
  payload?: Record<string, unknown>
): Promise<void> {
  const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  await setDoc(doc(db, 'projects', projectId, 'events', id), {
    projectId,
    type,
    sourceApp,
    ...(payload ? { payload } : {}),
    createdAt: serverTimestamp(),
  })
}

// ─── Read (one-time) ─────────────────────────────────────────────────────────
export async function getProjectEvents(
  projectId: string,
  max: number = 20
): Promise<HubEvent[]> {
  const snaps = await getDocs(
    query(
      collection(db, 'projects', projectId, 'events'),
      orderBy('createdAt', 'desc'),
      limit(max)
    )
  )
  return snaps.docs.map(s => toEvent(s.id, s.data()))
}

// ─── Read (realtime) ─────────────────────────────────────────────────────────
// Checklist item: "App Registry-কে event-driven করা"। এটা সেই বাস্তবায়ন —
// caller-কে unsubscribe function ফেরত দেয়, useEffect cleanup-এ কল করতে হবে।
export function subscribeToEvents(
  projectId: string,
  onUpdate: (events: HubEvent[]) => void,
  max: number = 20
): () => void {
  const q = query(
    collection(db, 'projects', projectId, 'events'),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(s => toEvent(s.id, s.data())))
  }, () => {
    onUpdate([])   // permission/network error — খালি দেখায়, ভাঙে না
  })
}

// ─── Realtime existence-check (Structural "touched" সংকেত-এর realtime সংস্করণ) ──
// checkAppTouched (workflow.firestore.ts, Phase 4) এর one-time getDoc সংস্করণ
// এখনো আছে (কোথাও one-time check যথেষ্ট হলে সেটাই থাকবে) — এটা তার
// পাশাপাশি realtime বিকল্প, EcosystemAppsCard এখন থেকে এটা ব্যবহার করবে।
export function subscribeToAppTouched(
  projectId: string,
  checkPath: string,
  onUpdate: (exists: boolean | null) => void
): () => void {
  const [collectionName, docId] = checkPath.split('/')
  const ref = doc(db, 'projects', projectId, collectionName, docId)
  return onSnapshot(ref,
    snap => onUpdate(snap.exists()),
    () => onUpdate(null)
  )
}
