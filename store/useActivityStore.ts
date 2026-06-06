// store/useActivityStore.ts
import { create } from 'zustand'
import { ActivityLog } from '@/lib/types/activity.types'
import { getActivityLogs, getAllActivityLogs } from '@/lib/firestore/activity.firestore'

interface ActivityState {
  // per-project logs
  projectLogs: Record<string, ActivityLog[]>
  // all-projects logs
  allLogs:     ActivityLog[]
  loading:     boolean
  fetchProject:(projectId: string) => Promise<void>
  fetchAll:    (projectIds: string[]) => Promise<void>
}

export const useActivityStore = create<ActivityState>((set) => ({
  projectLogs: {},
  allLogs:     [],
  loading:     false,

  fetchProject: async (projectId) => {
    set({ loading: true })
    try {
      const logs = await getActivityLogs(projectId)
      set(s => ({
        projectLogs: { ...s.projectLogs, [projectId]: logs },
        loading: false,
      }))
    } catch {
      set({ loading: false })
    }
  },

  fetchAll: async (projectIds) => {
    set({ loading: true })
    try {
      const logs = await getAllActivityLogs(projectIds)
      set({ allLogs: logs, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
