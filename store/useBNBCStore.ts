// store/useBNBCStore.ts
import { create } from 'zustand'
import { BNBCSettings, BNBCFormData } from '@/lib/types/bnbc.types'
import { getBNBCSettings, saveBNBCSettings } from '@/lib/firestore/bnbc.firestore'

interface BNBCState {
  data:    Record<string, BNBCSettings>
  loading: Record<string, boolean>
  saving:  boolean
  error:   string | null
  fetch:   (projectId: string) => Promise<void>
  save:    (projectId: string, form: BNBCFormData) => Promise<boolean>
}

export const useBNBCStore = create<BNBCState>((set) => ({
  data: {}, loading: {}, saving: false, error: null,

  fetch: async (projectId) => {
    set(s => ({ loading: { ...s.loading, [projectId]: true } }))
    try {
      const info = await getBNBCSettings(projectId)
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
    const result = await saveBNBCSettings(projectId, form)
    if (result.success && result.data) {
      set(s => ({ saving: false, data: { ...s.data, [projectId]: result.data! } }))
      return true
    }
    set({ saving: false, error: result.error })
    return false
  },
}))
