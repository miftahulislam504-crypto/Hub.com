// store/useProjectStore.ts
import { create } from 'zustand'
import { Project } from '@/lib/types'
import {
  getProjects, createProject, updateProject,
  updateProjectStatus, deleteProject,
} from '@/lib/firestore'

interface ProjectState {
  projects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: (uid: string) => Promise<void>
  addProject: (uid: string, data: {
    projectName: string
    clientName: string
    location: string
    startDate: Date
    endDate?: Date
    description?: string
  }) => Promise<Project | null>
  editProject: (id: string, data: Partial<Project>) => Promise<boolean>
  changeStatus: (id: string, status: Project['status']) => Promise<void>
  removeProject: (id: string) => Promise<boolean>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async (uid) => {
    set({ loading: true, error: null })
    try {
      const projects = await getProjects(uid)
      set({ projects, loading: false })
    } catch (e: unknown) {
      set({ loading: false, error: String(e) })
    }
  },

  addProject: async (uid, data) => {
    const result = await createProject(uid, data)
    if (result.success && result.data) {
      set(s => ({ projects: [result.data!, ...s.projects] }))
      return result.data
    }
    return null
  },

  editProject: async (id, data) => {
    const result = await updateProject(id, data)
    if (result.success) {
      set(s => ({
        projects: s.projects.map(p => p.id === id ? { ...p, ...data } : p)
      }))
      return true
    }
    return false
  },

  changeStatus: async (id, status) => {
    await updateProjectStatus(id, status)
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, status } : p)
    }))
  },

  removeProject: async (id) => {
    const result = await deleteProject(id)
    if (result.success) {
      set(s => ({ projects: s.projects.filter(p => p.id !== id) }))
      return true
    }
    return false
  },
}))
