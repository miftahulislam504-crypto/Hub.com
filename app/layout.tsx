// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider }     from '@/components/shared/Toast'
import OfflineIndicator      from '@/components/shared/OfflineIndicator'

export const metadata: Metadata = {
  title:       { default: 'CivilOS Hub', template: '%s | CivilOS Hub' },
  description: 'সিভিল ইঞ্জিনিয়ারিং প্রজেক্ট ম্যানেজমেন্ট',
  manifest:    '/manifest.json',
  icons: {
    icon:  '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'default',
    title:          'CivilOS Hub',
  },
  keywords: ['civil engineering', 'project management', 'BNBC', 'Bangladesh', 'সিভিল'],
}

export const viewport: Viewport = {
  themeColor:          '#0D47A1',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <ToastProvider>
          <OfflineIndicator />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
