// app/dashboard/layout.tsx
'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import AuthProvider from '@/components/providers/AuthProvider'
import {
  LayoutDashboard, FolderOpen, LogOut,
  Building2, Menu, X, Loader2,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { href: '/dashboard/projects', icon: FolderOpen,       label: 'প্রজেক্টসমূহ' },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, initialized, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Sidebar */}
      <>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`
          fixed top-0 left-0 h-full w-64 bg-primary-900 text-white z-30
          transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <div className="bg-white rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-900 font-heading font-bold text-xl leading-none">C</span>
            </div>
            <div>
              <div className="font-heading font-bold text-lg leading-tight">CivilOS Hub</div>
              <div className="text-blue-300 text-xs">প্রজেক্ট ম্যানেজমেন্ট</div>
            </div>
            <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 flex-1">
            {navItems.map(item => {
              const active = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all
                    ${active
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User + logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="bg-accent-500 rounded-full w-9 h-9 flex items-center justify-center font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate">{user.displayName ?? 'Engineer'}</div>
                <div className="text-xs text-blue-300 truncate">{user.email}</div>
              </div>
            </div>
            <button onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white w-full transition-all">
              <LogOut size={18} />
              <span>লগআউট</span>
            </button>
          </div>
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden bg-primary-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <Building2 size={20} />
          <span className="font-heading font-bold text-lg">CivilOS Hub</span>
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
