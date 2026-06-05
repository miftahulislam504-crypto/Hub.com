// components/documents/UploadProgress.tsx
'use client'

interface Upload {
  file:     File
  progress: number
}

interface Props {
  uploads: Upload[]
}

export default function UploadProgress({ uploads }: Props) {
  if (!uploads.length) return null

  return (
    <div className="space-y-2">
      {uploads.map((u, i) => (
        <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-blue-800 truncate">{u.file.name}</span>
            <span className="text-sm font-bold text-primary-900 ml-2">{u.progress}%</span>
          </div>
          <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-900 rounded-full transition-all duration-300"
              style={{ width: `${u.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
