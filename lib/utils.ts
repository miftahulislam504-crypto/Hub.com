// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateProjectCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PRJ-${year}-${rand}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date)
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':    return 'চলমান'
    case 'on_hold':   return 'বিরতি'
    case 'completed': return 'সম্পন্ন'
    default:          return status
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-700 border-green-200'
    case 'on_hold':   return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
    default:          return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'শুভ সকাল'
  if (hour < 17) return 'শুভ অপরাহ্ন'
  return 'শুভ সন্ধ্যা'
}
