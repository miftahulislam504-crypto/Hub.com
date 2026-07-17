// lib/export/csv-export.ts
import { HubEvent, EVENT_LABELS_BN } from '@/lib/types/event.types'
import { MODULE_LABELS, ModuleId } from '@/lib/types/dependency.types'

// CSV-এর জন্য কোনো library লাগে না — pure string formatting। এটাই এখন
// পর্যন্ত সবচেয়ে genuinely tabular real data (Phase 5-এর event log),
// তাই CSV export এটার ওপর ভিত্তি করে বানানো হলো।
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateEventsCSV(events: HubEvent[]): string {
  const headers = ['সময়', 'ধরন', 'মডিউল', 'বিস্তারিত']
  const rows = events.map(e => {
    const moduleId = e.payload?.moduleId as ModuleId | undefined
    const moduleName = moduleId ? (MODULE_LABELS[moduleId] ?? moduleId) : ''
    const label = EVENT_LABELS_BN[e.type] ?? e.type
    return [
      new Date(e.createdAt).toLocaleString('en-BD'),
      label,
      moduleName,
      e.payload?.note ? String(e.payload.note) : '',
    ]
  })

  return [headers, ...rows]
    .map(row => row.map(escapeCsvField).join(','))
    .join('\n')
}
