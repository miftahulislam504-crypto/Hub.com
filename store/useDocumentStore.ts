// store/useDocumentStore.ts
import { create } from 'zustand'
import { ProjectDocument, DocumentCategory } from '@/lib/types/document.types'
import {
  getDocuments, uploadDocument, deleteDocument,
} from '@/lib/firestore/document.firestore'

interface UploadState {
  file:     File
  progress: number
  error?:   string
}

interface DocumentState {
  docs:      Record<string, ProjectDocument[]>   // projectId → docs
  loading:   Record<string, boolean>
  uploads:   UploadState[]
  error:     string | null
  fetch:     (projectId: string) => Promise<void>
  upload:    (
    projectId:   string,
    uid:         string,
    file:        File,
    category:    DocumentCategory,
    description: string
  ) => Promise<boolean>
  remove:    (projectId: string, docId: string, filePath: string) => Promise<boolean>
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  docs:    {},
  loading: {},
  uploads: [],
  error:   null,

  fetch: async (projectId) => {
    set(s => ({ loading: { ...s.loading, [projectId]: true } }))
    try {
      const docs = await getDocuments(projectId)
      set(s => ({
        docs:    { ...s.docs, [projectId]: docs },
        loading: { ...s.loading, [projectId]: false },
      }))
    } catch (e) {
      set(s => ({ loading: { ...s.loading, [projectId]: false }, error: String(e) }))
    }
  },

  upload: async (projectId, uid, file, category, description) => {
    // Track upload progress
    const uploadEntry: UploadState = { file, progress: 0 }
    set(s => ({ uploads: [...s.uploads, uploadEntry] }))

    const result = await uploadDocument(
      projectId, uid, file, category, description,
      (pct) => {
        set(s => ({
          uploads: s.uploads.map(u =>
            u.file === file ? { ...u, progress: pct } : u
          ),
        }))
      }
    )

    // Remove from uploads queue
    set(s => ({ uploads: s.uploads.filter(u => u.file !== file) }))

    if (result.success && result.data) {
      set(s => ({
        docs: {
          ...s.docs,
          [projectId]: [result.data!, ...(s.docs[projectId] ?? [])],
        },
      }))
      return true
    }
    set({ error: result.error })
    return false
  },

  remove: async (projectId, docId, filePath) => {
    const result = await deleteDocument(projectId, docId, filePath)
    if (result.success) {
      set(s => ({
        docs: {
          ...s.docs,
          [projectId]: (s.docs[projectId] ?? []).filter(d => d.id !== docId),
        },
      }))
      return true
    }
    set({ error: result.error })
    return false
  },
}))
