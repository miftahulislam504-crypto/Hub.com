// lib/types/report.types.ts
import { ModuleId } from './dependency.types'

// ═══════════════════════════════════════════════════════════════════════════
// REPORT CENTER — Phase 7
// ═══════════════════════════════════════════════════════════════════════════
// প্ল্যানের section 10-এ প্রতিটা App-এর নিজস্ব report list ছিল — সেগুলো
// হুবহু নিচে আছে। এই মুহূর্তে এই ১৫টার একটাও genuinely generate করা সম্ভব
// না, কারণ Architectural/Structural/Estimating/PM App এখনো কোনো real
// ডেটা দেয় না। এগুলো শুধু type হিসেবে প্রস্তুত।
//
// যেগুলো *সত্যিই* এখন generate হয় — Hub-এর নিজের ৩টা module-এর real
// data থেকে (Site Info, BNBC, Building) — সেগুলো "Hub" ব্লকে।
export type ReportType =
  // ── Hub-এর নিজের, এখন সত্যিই generate হয় ──
  | 'site_info_summary'
  | 'bnbc_parameters_report'
  | 'building_info_summary'

  // ── Architectural (section 10) — এখনো generate করার মতো ডেটা নেই ──
  | 'floor_area_report'
  | 'space_report'
  | 'architectural_summary'

  // ── Structural — এখনো generate করার মতো ডেটা নেই ──
  | 'analysis_report'
  | 'design_report'
  | 'reinforcement_report'
  | 'foundation_report'

  // ── Estimate — এখনো generate করার মতো ডেটা নেই ──
  | 'quantity_report'
  | 'boq'
  | 'rate_analysis'
  | 'cost_summary'

  // ── Project Management — এখনো generate করার মতো ডেটা নেই ──
  | 'progress_report'
  | 'cost_report'
  | 'delay_report'
  | 'resource_report'

export const REPORT_TYPE_LABELS_BN: Record<ReportType, string> = {
  site_info_summary:      'সাইট ইনফো সারাংশ',
  bnbc_parameters_report: 'BNBC ডিজাইন প্যারামিটার রিপোর্ট',
  building_info_summary:  'ভবনের তথ্য সারাংশ',
  floor_area_report:      'Floor Area Report',
  space_report:           'Space Report',
  architectural_summary:  'Architectural Summary',
  analysis_report:        'Analysis Report',
  design_report:          'Design Report',
  reinforcement_report:   'Reinforcement Report',
  foundation_report:      'Foundation Report',
  quantity_report:        'Quantity Report',
  boq:                    'BOQ',
  rate_analysis:          'Rate Analysis',
  cost_summary:           'Cost Summary',
  progress_report:        'Progress Report',
  cost_report:            'Cost Report',
  delay_report:           'Delay Report',
  resource_report:        'Resource Report',
}

// প্ল্যানের visual tree (section 10)-এর জন্য module-wise grouping —
// কোন report কোন module-এর আওতায় দেখাবে Hub Reports UI-তে।
export const REPORT_TYPES_BY_MODULE: Record<ModuleId, ReportType[]> = {
  siteInfo:      ['site_info_summary'],
  bnbcSettings:  ['bnbc_parameters_report'],
  buildingInfo:  ['building_info_summary'],
  architectural: ['floor_area_report', 'space_report', 'architectural_summary'],
  structural:    ['analysis_report', 'design_report', 'reinforcement_report', 'foundation_report'],
  estimating:    ['quantity_report', 'boq', 'rate_analysis', 'cost_summary'],
  projectmgmt:   ['progress_report', 'cost_report', 'delay_report', 'resource_report'],
}

// `projects/{projectId}/reports/{reportId}` — প্ল্যানের Report object shape
// অনুযায়ী, কিন্তু ভারী content (PDF/Excel) এখানে না — প্ল্যান section 12-এর
// নিয়ম মেনে শুধু ছোট markdown/text content Firestore-এ, ডাউনলোডযোগ্য ফাইল
// Phase 8 (Export Center)-এর কাজ।
export interface HubReport {
  id: string                // "RPT-{module}-{type}"
  projectId: string
  module: ModuleId
  type: ReportType
  title: string
  version: number           // এই report নিজে কতবার regenerate হয়েছে
  sourceVersion: number      // যে module-version থেকে generate হয়েছে (Phase 2)
  content: string            // markdown text — ছোট summary, PDF না
  generatedAt: string
  generatedBy?: { uid: string; displayName: string | null }
}
