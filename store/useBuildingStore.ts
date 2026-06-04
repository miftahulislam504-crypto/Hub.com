// store/useBuildingStore.ts
import { create } from 'zustand'
import { BuildingInfo, BuildingFormData } from '@/lib/types/building.types'
import { getBuildingInfo, saveBuildingInfo } from '@/lib/firestore/building.firestore'

interface BuildingState {
  data:    Record<string, BuildingInfo>
  loading: Record<string, boolean>
  saving:  boolean
  error:   string | null
  fetch:   (projectId: string) => Promise<void>
  save:    (projectId: string, form: BuildingFormData) => Promise<boolean>
}

export const useBuildingStore = create<BuildingState>((set) => ({
  data: {}, loading: {}, saving: false, error: null,

  fetch: async (projectId) => {
    set(s => ({ loading: { ...s.loading, [projectId]: true } }))
    try {
      const info = await getBuildingInfo(projectId)
      set(s => ({
        data:    info ? { ...s.data, [projectId]: info } : s.data,
        loading: { ...s.loading, [projectId]: false },
      }))
    } catch (e) {
      set(s => ({ loading: { ...s.loading, [projectId]: false }, error: String(e) }))
    }
  },

  save: async (projectId, form) => {
    set({ saving: true, error: null })
    const result = await saveBuildingInfo(projectId, form)
    if (result.success && result.data) {
      set(s => ({ saving: false, data: { ...s.data, [projectId]: result.data! } }))
      return true
    }
    set({ saving: false, error: result.error })
    return false
  },
}))
