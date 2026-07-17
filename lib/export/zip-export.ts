// lib/export/zip-export.ts
import JSZip from 'jszip'
import { Project } from '@/lib/types'
import { HubExportPayload } from '@/lib/types/integration.types'
import { HubReport } from '@/lib/types/report.types'

// প্ল্যানের section 11 অনুযায়ী ঠিক এই structure:
//   /project /architecture /structural /estimate /management /reports
//   /project-manifest.json
// যেসব folder-এ real data নেই (architecture/structural/estimate/
// management — কোনো App এখনো shared model-এ যুক্ত হয়নি), সেখানে খালি
// folder না রেখে একটা NOTE.txt রাখা হয়েছে যেটা honestly বলে কেন খালি।
export async function generateProjectPackage(
  project: Project,
  payload: HubExportPayload,
  reports: HubReport[]
): Promise<Blob> {
  const zip = new JSZip()

  // /project — Hub-এর নিজের real data
  const projectFolder = zip.folder('project')!
  projectFolder.file('project-info.json', JSON.stringify({
    projectId: project.id,
    projectCode: project.projectCode,
    projectName: project.projectName,
    clientName: project.clientName,
    location: project.location,
    status: project.status,
  }, null, 2))
  if (payload.siteInfo)     projectFolder.file('site-info.json', JSON.stringify(payload.siteInfo, null, 2))
  if (payload.bnbcSettings) projectFolder.file('bnbc-settings.json', JSON.stringify(payload.bnbcSettings, null, 2))
  if (payload.buildingInfo) projectFolder.file('building-info.json', JSON.stringify(payload.buildingInfo, null, 2))

  // /architecture, /structural, /estimate, /management — এখনো কোনো real
  // data নেই, honestly বলে দেওয়া হচ্ছে কেন
  const emptyNote = (appName: string) =>
    `${appName} App এখনো Hub-এর shared model-এ যুক্ত হয়নি।\n` +
    `এই ফোল্ডারে এখনো কোনো ডেটা নেই — সেই App তৈরি/সংযুক্ত হলে এখানে\n` +
    `real content আসবে।\n`

  zip.folder('architecture')!.file('NOTE.txt', emptyNote('Architectural Drawing'))
  zip.folder('structural')!.file('NOTE.txt', emptyNote('Structural Design & Analysis'))
  zip.folder('estimate')!.file('NOTE.txt', emptyNote('Estimating & Costing'))
  zip.folder('management')!.file('NOTE.txt', emptyNote('Project Management'))

  // /reports — Phase 7-এর real generated report গুলো
  const reportsFolder = zip.folder('reports')!
  if (reports.length === 0) {
    reportsFolder.file('NOTE.txt', 'এখনো কোনো report generate করা হয়নি — Reports সেকশন থেকে তৈরি করুন।\n')
  } else {
    for (const report of reports) {
      reportsFolder.file(`${report.type}.md`, report.content)
    }
  }

  // /project-manifest.json — পুরো package-এর সারাংশ
  const manifest = {
    packageVersion: '1.0',
    generatedAt: new Date().toISOString(),
    project: { id: project.id, code: project.projectCode, name: project.projectName },
    contents: {
      project: {
        siteInfo: !!payload.siteInfo,
        bnbcSettings: !!payload.bnbcSettings,
        buildingInfo: !!payload.buildingInfo,
      },
      architecture: 'not_yet_integrated',
      structural: 'not_yet_integrated',
      estimate: 'not_yet_integrated',
      management: 'not_yet_integrated',
      reports: reports.map(r => ({ type: r.type, version: r.version, sourceVersion: r.sourceVersion })),
    },
  }
  zip.file('project-manifest.json', JSON.stringify(manifest, null, 2))

  return zip.generateAsync({ type: 'blob' })
}
