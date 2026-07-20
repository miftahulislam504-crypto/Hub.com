'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/useAuthStore'
import AuthProvider from '@/components/providers/AuthProvider'
import {
  LayoutDashboard, FolderOpen, LogOut,
  Menu, X, Clock, ExternalLink,
  ChevronDown, ChevronUp,
  BookOpen, Building2, DraftingCompass, Calculator,
  BarChart2, Layers, ChevronRight,
} from 'lucide-react'

const otherApps = [
  { href: 'https://enginexstruc.vercel.app',   icon: Building2,      label: 'Structural',        sub: 'Structural Design'       },
  { href: 'https://enginexdraw.vercel.app',  icon: DraftingCompass,label: 'Arch Drawing',      sub: 'Architectural Drawing'   },
  { href: 'https://enginexquanta.vercel.app',     icon: Calculator,     label: 'Estimating',        sub: 'Cost Estimation'         },
  { href: 'https://enginexproject.vercel.app',           icon: LayoutDashboard,label: 'Project Mgmt',      sub: 'Project Management'      },
  { href: 'https://enginexlearn.vercel.app',     icon: BookOpen,       label: 'Learning',          sub: 'Learning Platform'       },
]

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/projects', icon: FolderOpen,      label: 'Projects'  },
  { href: '/dashboard/activity', icon: Clock,           label: 'Activity'  },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, initialized, signOut } = useAuthStore()

  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [appsExpanded, setAppsExpanded] = useState(true)

  useEffect(() => {
    if (initialized && !user) router.replace('/login')
  }, [user, initialized, router])

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.displayName ?? user.email ?? 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-surface-card border-r border-surface-border z-30
        flex flex-col
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Image src="/logo.png" alt="EngineX" width={20} height={20}
              className="object-contain brightness-0 invert" priority />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text-primary leading-tight">EngineX Hub</div>
            <div className="text-xs text-text-muted">Project Management</div>
          </div>
          <button className="lg:hidden text-text-muted hover:text-text-primary p-1"
            onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 pt-4 pb-2 flex-shrink-0 space-y-0.5">
          {navItems.map(item => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={active ? 'nav-item-active' : 'nav-item'}>
                <item.icon size={16} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-brand-500" />}
              </Link>
            )
          })}
        </nav>

        <div className="mx-4 divider" />

        {/* Other Apps */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <button
            onClick={() => setAppsExpanded(p => !p)}
            className="flex items-center justify-between w-full px-3 py-1.5 mb-1
                       text-text-muted hover:text-text-secondary transition-colors rounded-lg">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={11} /> EngineX Apps
            </span>
            {appsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {appsExpanded && (
            <div className="space-y-0.5">
              {otherApps.map(app => (
                <a key={app.href} href={app.href}
                  target="_blank" rel="noopener noreferrer"
                  className="nav-item group">
                  <app.icon size={15} className="flex-shrink-0 text-text-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-secondary truncate">{app.label}</div>
                    <div className="text-xs text-text-muted truncate">{app.sub}</div>
                  </div>
                  <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* User + Logout */}
        <div className="px-3 pb-3 pt-2 border-t border-surface-border flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center
                            text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-text-primary truncate">
                {user.displayName ?? 'Engineer'}
              </div>
              <div className="text-xs text-text-muted truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={signOut} className="nav-item w-full text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="lg:hidden bg-surface-card border-b border-surface-border px-4 py-3
                           flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-text-secondary">
            <Menu size={20} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={18} height={18}
              className="object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-sm text-text-primary">EngineX Hub</span>
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
