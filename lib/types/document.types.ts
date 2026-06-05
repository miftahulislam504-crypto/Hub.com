// lib/types/document.types.ts

export interface ProjectDocument {
  id:           string
  projectId:    string
  name:         string
  category:     DocumentCategory
  fileUrl:      string
  filePath:     string       // Firebase Storage path
  fileType:     string       // MIME type
  fileSize:     number       // bytes
  uploadedBy:   string       // uid
  uploadedAt:   Date
  description?: string
}

export type DocumentCategory =
  | 'drawings'
  | 'reports'
  | 'boq'
  | 'contracts'
  | 'photos'
  | 'other'

export const DOC_CATEGORIES: {
  code: DocumentCategory
  label: string
  icon: string
  color: string
  bg: string
  accept: string
}[] = [
  { code: 'drawings',  label: 'ড্রইং',       icon: '📐', color: '#1565C0', bg: '#E3F2FD', accept: '.pdf,.dwg,.dxf,.png,.jpg,.jpeg' },
  { code: 'reports',   label: 'রিপোর্ট',      icon: '📊', color: '#2E7D32', bg: '#E8F5E9', accept: '.pdf,.doc,.docx,.xlsx,.xls'      },
  { code: 'boq',       label: 'BOQ',           icon: '📋', color: '#E65100', bg: '#FBE9E7', accept: '.pdf,.xlsx,.xls,.csv'            },
  { code: 'contracts', label: 'চুক্তিপত্র',   icon: '📝', color: '#4A148C', bg: '#F3E5F5', accept: '.pdf,.doc,.docx'                 },
  { code: 'photos',    label: 'ফটো',           icon: '📸', color: '#00695C', bg: '#E0F2F1', accept: '.jpg,.jpeg,.png,.webp,.heic'     },
  { code: 'other',     label: 'অন্যান্য',     icon: '📁', color: '#546E7A', bg: '#ECEFF1', accept: '*'                               },
]

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf'))                              return '📄'
  if (mimeType.includes('image'))                            return '🖼️'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return '📊'
  if (mimeType.includes('word') || mimeType.includes('document'))  return '📝'
  if (mimeType.includes('dwg') || mimeType.includes('dxf'))        return '📐'
  return '📎'
}

export function getTotalSize(docs: ProjectDocument[]): string {
  const total = docs.reduce((sum, d) => sum + d.fileSize, 0)
  return formatFileSize(total)
}
