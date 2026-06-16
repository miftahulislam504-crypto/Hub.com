// app/dashboard/layout.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/useAuthStore'
import AuthProvider from '@/components/providers/AuthProvider'
import { useLang } from '@/components/providers/LanguageProvider'
import {
  LayoutDashboard, FolderOpen, LogOut,
  Menu, X, Loader2, Clock, ExternalLink,
  ChevronDown, ChevronUp, Languages,
  BookOpen, Building2, PenRuler, Calculator,
  BarChart2, Layers,
} from 'lucide-react'

// ─── Other EngineX Apps ────────────────────────────────────────────────────
const otherApps = [
  {
    href:    'https://enginex-structural.vercel.app',
    icon:    Building2,
    labelKey: 'appStructural' as const,
    subKey:   'appStructuralSub' as const,
  },
  {
    href:    'https://enginex-archdrawing.vercel.app',
    icon:    PenRuler,
    labelKey: 'appArchDrawing' as const,
    subKey:   'appArchDrawingSub' as const,
  },
  {
    href:    'https://enginex-estimate.vercel.app',
    icon:    Calculator,
    labelKey: 'appEstimate' as const,
    subKey:   'appEstimateSub' as const,
  },
  {
    href:    'https://enginex-learning.vercel.app',
    icon:    BookOpen,
    labelKey: 'appLearn' as const,
    subKey:   'appLearnSub' as const,
  },
  {
    href:    'https://enginex-reports.vercel.app',
    icon:    BarChart2,
    labelKey: 'appReports' as const,
    subKey:   'appReportsSub' as const,
  },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, initialized, signOut } = useAuthStore()
  const { t, toggleLang } = useLang()

  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [appsExpanded, setAppsExpanded] = useState(true)

  const navItems = [
    { href: '/dashboard',          icon: LayoutDashboard, labelKey: 'navDashboard' as const },
    { href: '/dashboard/projects', icon: FolderOpen,      labelKey: 'navProjects'  as const },
    { href: '/dashboard/activity', icon: Clock,           labelKey: 'navActivity'  as const },
  ]

  useEffect(() => {
    if (initialized && !user) router.replace('/login')
  }, [user, initialized, router])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary-900" size={40} />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.displayName ?? user.email ?? 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-primary-900 text-white z-30
        flex flex-col
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="bg-white rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 p-1.5">
            <Image
              src="/logo.png"
              alt="CivilOS"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-bold text-sm leading-tight">{t('appName')}</div>
            <div className="text-blue-300 text-xs truncate">{t('appSubtitle')}</div>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white flex-shrink-0"
            onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="px-3 pt-4 pb-2 flex-shrink-0">
          {navItems.map(item => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mb-1 transition-all
                  ${active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}>
                <item.icon size={17} />
                <span className="text-sm">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mx-4 border-t border-white/10 flex-shrink-0" />

        {/* Other Apps */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <button
            onClick={() => setAppsExpanded(p => !p)}
            className="flex items-center justify-between w-full px-4 py-2
                       text-blue-300 hover:text-white transition-colors">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={12} />
              {t('otherApps')}
            </span>
            {appsExpanded
              ? <ChevronUp size={13} />
              : <ChevronDown size={13} />
            }
          </button>

          {appsExpanded && (
            <div className="mt-1 space-y-0.5">
              {otherApps.map(app => (
                <a
                  key={app.href}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                             text-blue-200 hover:bg-white/10 hover:text-white
                             transition-all group"
                >
                  <app.icon size={16} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{t(app.labelKey)}</div>
                    <div className="text-xs text-blue-400 truncate group-hover:text-blue-300">
                      {t(app.subKey)}
                    </div>
                  </div>
                  <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-70 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: Language + User + Logout */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0 space-y-1">

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full
                       text-blue-200 hover:bg-white/10 hover:text-white transition-all">
            <Languages size={17} />
            <span className="text-sm">{t('switchToEnglish')}</span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="bg-accent-500 rounded-full w-8 h-8 flex items-center justify-center
                            font-bold text-white flex-shrink-0 text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.displayName ?? t('engineer')}</div>
              <div className="text-xs text-blue-300 truncate">{user.email}</div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full
                       text-blue-200 hover:bg-white/10 hover:text-white transition-all">
            <LogOut size={17} />
            <span className="text-sm">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="lg:hidden bg-primary-900 text-white px-4 py-3
                           flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="bg-white rounded-lg w-7 h-7 flex items-center justify-center p-1 flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={22} height={22} className="object-contain" />
          </div>
          <span className="font-heading font-bold text-base">{t('appName')}</span>

          <button onClick={toggleLang}
            className="ml-auto text-xs font-semibold text-blue-200 hover:text-white
                       bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all
                       flex items-center gap-1.5">
            <Languages size={13} />
            {t('switchToEnglish')}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><DashboardLayoutContent>{children}</DashboardLayoutContent></AuthProvider>
}
