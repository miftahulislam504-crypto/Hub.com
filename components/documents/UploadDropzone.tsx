// components/documents/UploadDropzone.tsx
'use client'
import { useState, useRef } from 'react'
import { DOC_CATEGORIES, DocumentCategory } from '@/lib/types/document.types'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  onUpload:  (file: File, category: DocumentCategory, description: string) => Promise<void>
  uploading: boolean
}

const MAX_SIZE = 20 * 1024 * 1024  // 20 MB

export default function UploadDropzone({ onUpload, uploading }: Props) {
  const [dragging,    setDragging]    = useState(false)
  const [selectedFile, setSelected]  = useState<File | null>(null)
  const [category,    setCategory]   = useState<DocumentCategory>('drawings')
  const [description, setDescription] = useState('')
  const [sizeError,   setSizeError]  = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setSizeError('')
    if (file.size > MAX_SIZE) {
      setSizeError(`ফাইলটি ${(file.size / 1024 / 1024).toFixed(1)} MB — সর্বোচ্চ 20 MB অনুমোদিত।`)
      return
    }
    setSelected(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    await onUpload(selectedFile, category, description)
    setSelected(null)
    setDescription('')
  }

  const cat = DOC_CATEGORIES.find(c => c.code === category)!

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragging
            ? 'border-primary-900 bg-primary-50 scale-[1.01]'
            : selectedFile
              ? 'border-green-400 bg-green-50 cursor-default'
              : 'border-gray-200 hover:border-primary-900 hover:bg-gray-50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={cat.accept}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{cat.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setSelected(null); setSizeError('') }}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 text-sm">
              ফাইল টেনে আনুন বা <span className="text-primary-900">ক্লিক করুন</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">সর্বোচ্চ 20 MB</p>
          </>
        )}
      </div>

      {sizeError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          ⚠️ {sizeError}
        </div>
      )}

      {/* Category + Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ক্যাটাগরি</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as DocumentCategory)}
            className="input-field"
          >
            {DOC_CATEGORIES.map(c => (
              <option key={c.code} value={c.code}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">বিবরণ (ঐচ্ছিক)</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="ফাইলের সংক্ষিপ্ত বিবরণ"
            className="input-field"
            maxLength={120}
          />
        </div>
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedFile || uploading}
        className="btn-primary w-full"
      >
        {uploading
          ? <><Loader2 size={18} className="animate-spin" /> আপলোড হচ্ছে...</>
          : <><Upload size={18} /> আপলোড করুন</>
        }
      </button>
    </div>
  )
}
