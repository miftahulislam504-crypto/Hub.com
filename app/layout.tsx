// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CivilOS Hub',
  description: 'সিভিল ইঞ্জিনিয়ারিং প্রজেক্ট ম্যানেজমেন্ট',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  )
}
