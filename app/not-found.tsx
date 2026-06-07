// app/not-found.tsx
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-heading font-bold text-primary-900 opacity-10 mb-2">
          404
        </div>
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center
          justify-center mx-auto mb-4">
          <Search size={28} className="text-primary-900" />
        </div>
        <h1 className="text-xl font-heading font-bold text-gray-900 mb-2">
          পেইজ পাওয়া যায়নি
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          আপনি যে পেইজটি খুঁজছেন তা নেই বা সরানো হয়েছে।
        </p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-900
            text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
          <Home size={16} /> ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    </div>
  )
}
