// lib/types/activity.types.ts

export interface ActivityLog {
  id:          string
  projectId:   string
  action:      string
  description: string
  userId:      string
  timestamp:   Date
}

export const ACTION_META: Record<string, {
  icon:  string
  label: string
  color: string
  bg:    string
}> = {
  project_created:  { icon: '🆕', label: 'প্রজেক্ট তৈরি',       color: '#1565C0', bg: '#E3F2FD' },
  project_updated:  { icon: '✏️', label: 'প্রজেক্ট আপডেট',      color: '#E65100', bg: '#FBE9E7' },
  site_info_saved:  { icon: '📍', label: 'সাইট ইনফো সংরক্ষণ',   color: '#2E7D32', bg: '#E8F5E9' },
  bnbc_saved:       { icon: '📐', label: 'BNBC সেটিংস',          color: '#4A148C', bg: '#F3E5F5' },
  building_saved:   { icon: '🏗️', label: 'ভবনের তথ্য',           color: '#37474F', bg: '#ECEFF1' },
  document_added:   { icon: '📄', label: 'ডকুমেন্ট আপলোড',       color: '#006064', bg: '#E0F7FA' },
  document_deleted: { icon: '🗑️', label: 'ডকুমেন্ট ডিলিট',       color: '#B71C1C', bg: '#FFEBEE' },
}

export function getActionMeta(action: string) {
  return ACTION_META[action] ?? {
    icon: '📌', label: action, color: '#546E7A', bg: '#ECEFF1',
  }
}

export function groupByDate(logs: ActivityLog[]): Record<string, ActivityLog[]> {
  const groups: Record<string, ActivityLog[]> = {}
  logs.forEach(log => {
    const key = log.timestamp.toLocaleDateString('en-BD', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  })
  return groups
}
