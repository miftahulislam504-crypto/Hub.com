// lib/firestore/activity.firestore.ts
import {
  collection, query, orderBy, limit,
  getDocs, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ActivityLog } from '@/lib/types/activity.types'

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

// Fetch activity logs for one project
export async function getActivityLogs(
  projectId: string,
  maxItems = 50
): Promise<ActivityLog[]> {
  const q = query(
    collection(db, 'projects', projectId, 'activity_logs'),
    orderBy('timestamp', 'desc'),
    limit(maxItems)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return {
      id:          d.id,
      projectId,
      action:      data.action      ?? '',
      description: data.description ?? '',
      userId:      data.userId      ?? '',
      timestamp:   toDate(data.timestamp),
    }
  })
}

// Fetch activity logs across ALL projects for a user
export async function getAllActivityLogs(
  projectIds: string[],
  maxPerProject = 20
): Promise<ActivityLog[]> {
  const all: ActivityLog[] = []

  for (const projectId of projectIds.slice(0, 10)) {
    try {
      const logs = await getActivityLogs(projectId, maxPerProject)
      all.push(...logs)
    } catch (_) { /* skip */ }
  }

  // Sort all by time desc
  return all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
