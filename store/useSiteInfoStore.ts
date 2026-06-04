// store/useSiteInfoStore.ts
import { create } from 'zustand'
import { SiteInfo, SiteInfoFormData } from '@/lib/types/site-info.types'
import { getSiteInfo, saveSiteInfo } from '@/lib/firestore/site-info.firestore'

interface SiteInfoState {
  data: Record<string, SiteInfo>   // projectId → SiteInfo
  loading: Record<string, boolean>
  saving: boolean
  error: string | null
  fetch: (projectId: string) => Promise<void>
  save: (projectId: string, form: SiteInfoFormData) => Promise<boolean>
}

export const useSiteInfoStore = create<SiteInfoState>((set, get) => ({
  data: {},
  loading: {},
  saving: false,
  error: null,

  fetch: async (projectId) => {
    set(s => ({ loading: { ...s.loading, [projectId]: true } }))
    try {
      const info = await getSiteInfo(projectId)
      set(s => ({
        data: info ? { ...s.data, [projectId]: info } : s.data,
        loading: { ...s.loading, [projectId]: false },
      }))
    } catch (e) {
      set(s => ({ loading: { ...s.loading, [projectId]: false }, error: String(e) }))
    }
  },

  save: async (projectId, form) => {
    set({ saving: true, error: null })
    const result = await saveSiteInfo(projectId, form)
    if (result.success && result.data) {
      set(s => ({
        saving: false,
        data: { ...s.data, [projectId]: result.data! },
      }))
      return true
    }
    set({ saving: false, error: result.error })
    return false
  },
}))
