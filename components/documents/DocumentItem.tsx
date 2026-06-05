// components/documents/DocumentItem.tsx
'use client'
import { useState } from 'react'
import { ProjectDocument, DOC_CATEGORIES, formatFileSize, getFileIcon } from '@/lib/types/document.types'
import { formatDate } from '@/lib/utils'
import { Download, Trash2, Loader2, ExternalLink } from 'lucide-react'

interface Props {
  doc:      ProjectDocument
  onDelete: (doc: ProjectDocument) => Promise<void>
}

export default function DocumentItem({ doc, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)

  const cat = DOC_CATEGORIES.find(c => c.code === doc.category)

  const handleDelete = async () => {
    if (!confirm(`"${doc.name}" ডিলিট করবেন?`)) return
    setDeleting(true)
    await onDelete(doc)
    setDeleting(false)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
      transition-colors group border-b border-gray-50 last:border-0">

      {/* File icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center
          text-xl flex-shrink-0"
        style={{ backgroundColor: cat?.bg ?? '#F3F4F6' }}
      >
        {getFileIcon(doc.fileType)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: cat?.bg, color: cat?.color }}
          >
            {cat?.icon} {cat?.label}
          </span>
          <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
          <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</span>
        </div>
        {doc.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
        transition-opacity flex-shrink-0">
        {/* Open/Download */}
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
          title="খুলুন"
        >
          <ExternalLink size={16} />
        </a>
        <a
          href={doc.fileUrl}
          download={doc.name}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="ডাউনলোড"
        >
          <Download size={16} />
        </a>
        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          title="ডিলিট"
        >
          {deleting
            ? <Loader2 size={16} className="animate-spin" />
            : <Trash2 size={16} />
          }
        </button>
      </div>
    </div>
  )
}
