// components/shared/OfflineIndicator.tsx
'use client'
import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const handleOnline  = () => setOffline(false)
    const handleOffline = () => setOffline(true)

    setOffline(!navigator.onLine)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white
      flex items-center justify-center gap-2 py-2 text-sm font-semibold">
      <WifiOff size={16} />
      ইন্টারনেট সংযোগ নেই — অফলাইন মোডে চলছে
    </div>
  )
}
