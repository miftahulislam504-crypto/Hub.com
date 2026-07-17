// lib/firestore/module-data.firestore.ts
//
// প্ল্যানের section 12 নীতি: "Large Geometry, Analysis Matrix, Mesh, Large
// Result Dataset, Generated PDF, Excel, Model Snapshot — এগুলো Firebase
// Storage-এ থাকবে। Firestore: metadata/status/reference/version/storagePath।"
//
// এই ফাইল document.firestore.ts-এর (Documents ফিচার, আগে থেকেই কাজ করছে)
// একদম একই, প্রমাণিত pattern অনুসরণ করে — নতুন কিছু আবিষ্কার করা হয়নি।
import {
  doc, setDoc, getDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { ModuleId } from '@/lib/types/dependency.types'
import { SourceApp } from '@/lib/types/contract.types'
import { bumpModuleVersion } from '@/lib/firestore/dependency.firestore'

export interface ModuleDataFile {
  fileName: string
  fileUrl: string
  storagePath: string
  fileSize: number
  fileType: string
  uploadedAt: string
  sourceApp: SourceApp
  moduleVersion: number
}

// Storage path: projects/{projectId}/moduleData/{moduleId}/{timestamp}_{filename}
// (document.firestore.ts-এর projects/{projectId}/documents/... এর সাথে সিবলিং)
export async function uploadModuleData(
  projectId: string,
  moduleId: ModuleId,
  sourceApp: SourceApp,
  file: File,
  onProgress?: (pct: number) => void
): Promise<ModuleDataFile> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `projects/${projectId}/moduleData/${moduleId}/${Date.now()}_${safeName}`
  const storageRef = ref(storage, storagePath)

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
  const moduleVersion = await bumpModuleVersion(projectId, moduleId)   // Phase 2 cascade + Phase 5 event

  const record: ModuleDataFile = {
    fileName: file.name,
    fileUrl,
    storagePath,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    sourceApp,
    moduleVersion,
  }

  // Firestore-এ শুধু reference — heavy bytes না (প্ল্যানের section 12 নীতি)
  await setDoc(doc(db, 'projects', projectId, 'moduleMetadata', moduleId), {
    ...record, updatedAt: serverTimestamp(),
  })

  return record
}

export async function getModuleDataFile(
  projectId: string,
  moduleId: ModuleId
): Promise<ModuleDataFile | null> {
  const snap = await getDoc(doc(db, 'projects', projectId, 'moduleMetadata', moduleId))
  if (!snap.exists()) return null
  const d = snap.data()
  if (!d.storagePath) return null   // moduleMetadata থাকতে পারে কিন্তু ফাইল ছাড়া (Phase 6-এর publishModule metadata)
  return {
    fileName: d.fileName, fileUrl: d.fileUrl, storagePath: d.storagePath,
    fileSize: d.fileSize, fileType: d.fileType, uploadedAt: d.uploadedAt,
    sourceApp: d.sourceApp, moduleVersion: d.moduleVersion,
  } as ModuleDataFile
}
