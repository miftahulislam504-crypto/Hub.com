// lib/firestore/document.firestore.ts
import {
  collection, doc, addDoc, deleteDoc,
  getDocs, query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore'
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { ProjectDocument, DocumentCategory } from '@/lib/types/document.types'
import { ServiceResult } from '@/lib/types'

const docsCol = (projectId: string) =>
  collection(db, 'projects', projectId, 'documents')

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate()
  return new Date()
}

// ─── Fetch all documents for a project ───────────────────────────────────────
export async function getDocuments(projectId: string): Promise<ProjectDocument[]> {
  const q    = query(docsCol(projectId), orderBy('uploadedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    return {
      id:          d.id,
      projectId,
      name:        data.name        ?? '',
      category:    data.category    ?? 'other',
      fileUrl:     data.fileUrl     ?? '',
      filePath:    data.filePath    ?? '',
      fileType:    data.fileType    ?? '',
      fileSize:    data.fileSize    ?? 0,
      uploadedBy:  data.uploadedBy  ?? '',
      uploadedAt:  toDate(data.uploadedAt),
      description: data.description ?? undefined,
    } as ProjectDocument
  })
}

// ─── Upload file + save metadata ─────────────────────────────────────────────
export async function uploadDocument(
  projectId: string,
  uid:       string,
  file:      File,
  category:  DocumentCategory,
  description: string,
  onProgress?: (pct: number) => void
): Promise<ServiceResult<ProjectDocument>> {
  try {
    // Storage path: projects/{projectId}/documents/{timestamp}_{filename}
    const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath  = `projects/${projectId}/documents/${Date.now()}_${safeName}`
    const storageRef = ref(storage, filePath)

    // Upload with progress
    await new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file)
      task.on(
        'state_changed',
        snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        () => resolve()
      )
    })

    const fileUrl = await getDownloadURL(storageRef)

    // Save metadata to Firestore
    const docRef = await addDoc(docsCol(projectId), {
      projectId,
      name:        file.name,
      category,
      fileUrl,
      filePath,
      fileType:    file.type || 'application/octet-stream',
      fileSize:    file.size,
      uploadedBy:  uid,
      description: description || null,
      uploadedAt:  serverTimestamp(),
    })

    // Activity log
    try {
      await addDoc(
        collection(db, 'projects', projectId, 'activity_logs'),
        { action: 'document_added', description: `ফাইল আপলোড: ${file.name}`, timestamp: serverTimestamp() }
      )
    } catch (_) { /* non-critical */ }

    return {
      success: true,
      data: {
        id: docRef.id, projectId,
        name: file.name, category, fileUrl, filePath,
        fileType: file.type, fileSize: file.size,
        uploadedBy: uid, uploadedAt: new Date(),
        description: description || undefined,
      },
    }
  } catch (e: unknown) {
    return { success: false, error: `আপলোড করতে সমস্যা: ${e}` }
  }
}

// ─── Delete document ──────────────────────────────────────────────────────────
export async function deleteDocument(
  projectId: string,
  docId:     string,
  filePath:  string
): Promise<ServiceResult<void>> {
  try {
    // Delete from Storage
    try {
      await deleteObject(ref(storage, filePath))
    } catch (_) { /* file may not exist */ }

    // Delete Firestore record
    await deleteDoc(doc(docsCol(projectId), docId))

    // Activity log
    try {
      await addDoc(
        collection(db, 'projects', projectId, 'activity_logs'),
        { action: 'document_deleted', description: 'ফাইল মুছে ফেলা হয়েছে', timestamp: serverTimestamp() }
      )
    } catch (_) { /* non-critical */ }

    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: `ডিলিট করতে সমস্যা: ${e}` }
  }
}
