import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider }   from '@/components/shared/Toast'
import OfflineIndicator    from '@/components/shared/OfflineIndicator'
import { LanguageProvider } from '@/components/providers/LanguageProvider'

export const metadata: Metadata = {
  title:       { default: 'CivilOS Hub', template: '%s | CivilOS Hub' },
  description: 'Civil Engineering Project Management Platform',
  manifest:    '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico',          sizes: 'any' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'CivilOS Hub' },
  keywords: ['civil engineering', 'project management', 'BNBC', 'Bangladesh'],
}

export const viewport: Viewport = {
  themeColor:   '#2563eb',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>
            <OfflineIndicator />
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
