// app/dashboard/loading.tsx
import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={36} className="animate-spin text-primary-900" />
        <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
      </div>
    </div>
  )
}
