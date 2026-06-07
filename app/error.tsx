// app/error.tsx
'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="bn">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center
              justify-center mx-auto mb-5">
              <AlertTriangle size={40} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              সমস্যা হয়েছে!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              অপ্রত্যাশিত ত্রুটি। পেইজ রিলোড করুন অথবা হোমে ফিরে যান।
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-900
                  text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
                <RefreshCw size={16} /> আবার চেষ্টা
              </button>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 border-2
                  border-gray-200 text-gray-700 rounded-xl font-semibold text-sm
                  hover:border-gray-300 transition-colors">
                <Home size={16} /> হোম
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
