// app/login/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useLang } from '@/components/providers/LanguageProvider'
import Image from 'next/image'
import {
  Eye, EyeOff, Loader2, Languages,
  FolderKanban, BookOpenCheck, FileText, Link2,
} from 'lucide-react'
import AuthProvider from '@/components/providers/AuthProvider'

function LoginContent() {
  const router = useRouter()
  const { user, initialized, loading, error, signIn, signUp, resetPassword, clearError } = useAuthStore()
  const { t, toggleLang } = useLang()

  const [mode, setMode]           = useState<'login' | 'register' | 'reset'>('login')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

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

  type FeatureKey = 'loginFeature1'|'loginFeature2'|'loginFeature3'|'loginFeature4'
  const features: [typeof FolderKanban, FeatureKey][] = [
    [FolderKanban,   'loginFeature1'],
    [BookOpenCheck,  'loginFeature2'],
    [FileText,       'loginFeature3'],
    [Link2,          'loginFeature4'],
  ]

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Left brand panel (desktop) */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-primary-900 text-white px-12 relative">
        <button
          onClick={toggleLang}
          className="absolute top-5 right-5 flex items-center gap-1.5
                     text-blue-200 hover:text-white bg-white/10 hover:bg-white/20
                     px-3 py-1.5 rounded-lg text-sm font-semibold transition-all">
          <Languages size={14} />
          {t('switchToEnglish')}
        </button>

        <div className="bg-white rounded-2xl w-24 h-24 flex items-center justify-center mb-6 p-2 shadow-xl">
          <Image src="/logo.png" alt="CivilOS Hub" width={80} height={80} className="object-contain" priority />
        </div>
        <h1 className="font-heading text-4xl font-bold mb-2">{t('appName')}</h1>
        <p className="text-blue-200 text-center mb-10">{t('appSubtitle')}</p>

        <div className="space-y-4 w-full max-w-xs">
          {features.map(([Icon, key]) => (
            <div key={key} className="flex items-center gap-3 text-blue-100">
              <Icon size={18} className="flex-shrink-0 text-blue-300" />
              <span className="text-sm">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-white rounded-xl w-12 h-12 flex items-center justify-center shadow-md p-1.5 border border-gray-100">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
            </div>
            <div className="flex-1">
              <div className="font-heading font-bold text-xl text-primary-900">{t('appName')}</div>
              <div className="text-xs text-gray-500">{t('appSubtitle')}</div>
            </div>
            <button onClick={toggleLang}
              className="flex items-center gap-1 bg-primary-900 text-white
                         px-3 py-1.5 rounded-lg text-xs font-semibold
                         hover:bg-primary-700 transition-all">
              <Languages size={13} />
              {t('switchToEnglish')}
            </button>
          </div>

          {/* Form card */}
          <div className="card p-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login'    ? t('welcome')
               : mode === 'register' ? t('newAccount')
               : t('resetPassword')}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'login'    ? t('loginSubtitle')
               : mode === 'register' ? t('registerSubtitle')
               : t('resetSubtitle')}
            </p>

            {resetSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
                {t('resetEmailSent')}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')} required
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')} required
                  className="input-field"
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')} required minLength={6}
                      className="input-field pr-11"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => switchMode('reset')}
                    className="text-sm text-primary-900 hover:underline">
                    {t('forgotPassword')}
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Loader2 className="animate-spin" size={18} />}
                {mode === 'login'    ? t('loginBtn')
                 : mode === 'register' ? t('registerBtn')
                 : t('sendResetBtn')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {mode !== 'login' ? (
                <>{t('hasAccount')}{' '}
                  <button onClick={() => switchMode('login')}
                    className="text-primary-900 font-semibold hover:underline">
                    {t('loginHere')}
                  </button>
                </>
              ) : (
                <>{t('noAccount')}{' '}
                  <button onClick={() => switchMode('register')}
                    className="text-primary-900 font-semibold hover:underline">
                    {t('createAccount')}
                  </button>
                </>
              )}
            </div>

            {mode === 'reset' && (
              <div className="mt-3 text-center">
                <button onClick={() => switchMode('login')}
                  className="text-sm text-primary-900 hover:underline">
                  {t('backToLogin')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <AuthProvider><LoginContent /></AuthProvider>
}
