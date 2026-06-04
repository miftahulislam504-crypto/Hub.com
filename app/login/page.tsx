// app/login/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react'
import AuthProvider from '@/components/providers/AuthProvider'

function LoginContent() {
  const router = useRouter()
  const { user, initialized, loading, error, signIn, signUp, resetPassword, clearError } = useAuthStore()

  const [mode, setMode]               = useState<'login' | 'register' | 'reset'>('login')
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [resetSent, setResetSent]     = useState(false)

  useEffect(() => {
    if (initialized && user) router.replace('/dashboard')
  }, [user, initialized, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (mode === 'reset') {
      const ok = await resetPassword(email)
      if (ok) setResetSent(true)
      return
    }
    const ok = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, name)
    if (ok) router.replace('/dashboard')
  }

  const switchMode = (m: typeof mode) => {
    setMode(m); clearError(); setResetSent(false)
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary-900" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-primary-900 text-white px-12">
        <div className="bg-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
          <span className="text-primary-900 font-heading font-bold text-5xl leading-none">C</span>
        </div>
        <h1 className="font-heading text-4xl font-bold mb-2">CivilOS Hub</h1>
        <p className="text-blue-200 text-center mb-10">সিভিল ইঞ্জিনিয়ারিং প্রজেক্ট ম্যানেজমেন্ট</p>
        <div className="space-y-4 w-full max-w-xs">
          {[
            ['🏗️', 'প্রজেক্ট রেজিস্ট্রি'],
            ['📐', 'BNBC 2020 সেটিংস'],
            ['📁', 'ডকুমেন্ট সেন্টার'],
            ['🔗', 'সব App এর সাথে সংযোগ'],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-3 text-blue-100">
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-primary-900 rounded-xl w-12 h-12 flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <div className="font-heading font-bold text-xl text-primary-900">CivilOS Hub</div>
              <div className="text-xs text-gray-500">প্রজেক্ট ম্যানেজমেন্ট</div>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login' ? 'স্বাগতম!' : mode === 'register' ? 'নতুন একাউন্ট' : 'পাসওয়ার্ড রিসেট'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'login' ? 'আপনার একাউন্টে লগইন করুন' :
               mode === 'register' ? 'CivilOS Hub এ যোগ দিন' :
               'রিসেট লিংক পাঠানো হবে'}
            </p>

            {resetSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
                ✅ রিসেট ইমেইল পাঠানো হয়েছে। ইনবক্স চেক করুন।
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="আপনার নাম" required
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com" required
                  className="input-field"
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর" required minLength={6}
                      className="input-field pr-11"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => switchMode('reset')}
                    className="text-sm text-primary-900 hover:underline">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {mode === 'login' ? 'লগইন করুন' :
                 mode === 'register' ? 'একাউন্ট তৈরি করুন' :
                 'রিসেট লিংক পাঠান'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>একাউন্ট নেই?{' '}
                  <button onClick={() => switchMode('register')} className="text-primary-900 font-semibold hover:underline">
                    রেজিস্ট্রেশন করুন
                  </button>
                </>
              ) : (
                <>একাউন্ট আছে?{' '}
                  <button onClick={() => switchMode('login')} className="text-primary-900 font-semibold hover:underline">
                    লগইন করুন
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <AuthProvider><LoginContent /></AuthProvider>
}
