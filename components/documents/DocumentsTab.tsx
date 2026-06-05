// components/documents/DocumentsTab.tsx
'use client'
import { useEffect, useState } from 'react'
import { useDocumentStore }   from '@/store/useDocumentStore'
import { useAuthStore }       from '@/store/useAuthStore'
import {
  DOC_CATEGORIES, DocumentCategory,
  getTotalSize, formatFileSize,
} from '@/lib/types/document.types'
import { ProjectDocument } from '@/lib/types/document.types'
import UploadDropzone  from './UploadDropzone'
import DocumentItem    from './DocumentItem'
import UploadProgress  from './UploadProgress'
import { Layers, Plus, X, Loader2, HardDrive } from 'lucide-react'

interface Props { projectId: string }

export default function DocumentsTab({ projectId }: Props) {
  const { user }                              = useAuthStore()
  const { docs, loading, uploads, fetch, upload, remove } = useDocumentStore()
  const [activeCategory, setActiveCategory]   = useState<DocumentCategory | 'all'>('all')
  const [showUpload, setShowUpload]            = useState(false)
  const [uploading, setUploading]              = useState(false)

  const allDocs   = docs[projectId] ?? []
  const isLoading = loading[projectId]

  useEffect(() => { fetch(projectId) }, [projectId, fetch])

  const filtered = activeCategory === 'all'
    ? allDocs
    : allDocs.filter(d => d.category === activeCategory)

  const handleUpload = async (
    file: File, category: DocumentCategory, description: string
  ) => {
    if (!user) return
    setUploading(true)
    const ok = await upload(projectId, user.uid, file, category, description)
    setUploading(false)
    if (ok) setShowUpload(false)
  }

  const handleDelete = async (doc: ProjectDocument) => {
    await remove(projectId, doc.id, doc.filePath)
  }

  // Category counts
  const counts: Record<string, number> = { all: allDocs.length }
  DOC_CATEGORIES.forEach(c => {
    counts[c.code] = allDocs.filter(d => d.category === c.code).length
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <Layers size={20} className="text-primary-900" /> ডকুমেন্ট সেন্টার
        </h2>
        <button
          onClick={() => setShowUpload(v => !v)}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl
            transition-all ${showUpload
              ? 'bg-gray-100 text-gray-600'
              : 'bg-primary-900 text-white hover:bg-primary-700'
            }`}
        >
          {showUpload ? <><X size={16} /> বাতিল</> : <><Plus size={16} /> আপলোড</>}
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="card p-5 mb-5">
          <h3 className="section-title mb-4">📤 নতুন ফাইল আপলোড</h3>
          <UploadProgress uploads={uploads} />
          <UploadDropzone onUpload={handleUpload} uploading={uploading} />
        </div>
      )}

      {/* Storage indicator */}
      {allDocs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <HardDrive size={14} />
          <span>{allDocs.length}টি ফাইল · মোট {getTotalSize(allDocs)}</span>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        <CategoryBtn
          label="সব"
          count={counts.all}
          active={activeCategory === 'all'}
          color="#374151"
          onClick={() => setActiveCategory('all')}
        />
        {DOC_CATEGORIES.map(cat => (
          counts[cat.code] > 0 && (
            <CategoryBtn
              key={cat.code}
              label={`${cat.icon} ${cat.label}`}
              count={counts[cat.code]}
              active={activeCategory === cat.code}
              color={cat.color}
              onClick={() => setActiveCategory(cat.code)}
            />
          )
        ))}
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary-900" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <Layers size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">
            {activeCategory === 'all'
              ? 'কোনো ডকুমেন্ট নেই'
              : `এই ক্যাটাগরিতে কোনো ডকুমেন্ট নেই`}
          </p>
          {activeCategory === 'all' && (
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary inline-flex text-sm px-4 py-2"
            >
              <Plus size={16} /> প্রথম ফাইল আপলোড করুন
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map(doc => (
            <DocumentItem key={doc.id} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryBtn({
  label, count, active, color, onClick,
}: {
  label: string; count: number; active: boolean
  color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
        font-medium border-2 transition-all
        ${active ? 'text-white border-transparent' : 'bg-white border-gray-100 hover:border-gray-200'}`}
      style={active ? { backgroundColor: color, borderColor: color } : { color }}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
        ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {count}
      </span>
    </button>
  )
}
