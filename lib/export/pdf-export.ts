// lib/export/pdf-export.ts
import { jsPDF } from 'jspdf'
import { Project } from '@/lib/types'
import { HubReport } from '@/lib/types/report.types'

// ভবিষ্যতে যখন Architectural/Structural/Estimating/PM App real data দেবে,
// এই ফাংশনে তাদের section যোগ করা যাবে — এখন শুধু Hub-এর ৩টা genuine
// report + project info দিয়ে বানানো হচ্ছে।
export function generateProjectPDF(project: Project, reports: HubReport[]): Blob {
  const doc = new jsPDF()
  const marginX = 15
  let y = 20

  function addLine(text: string, size = 10, bold = false, gapAfter = 6) {
    if (y > 280) { doc.addPage(); y = 20 }
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const wrapped = doc.splitTextToSize(text, 180)
    doc.text(wrapped, marginX, y)
    y += (Array.isArray(wrapped) ? wrapped.length : 1) * (size / 2) + gapAfter
  }

  // Header
  addLine(project.projectName, 18, true, 2)
  addLine(`${project.projectCode} · ${project.clientName} · ${project.location}`, 10, false, 8)
  doc.setDrawColor(200)
  doc.line(marginX, y - 4, 195, y - 4)

  if (reports.length === 0) {
    addLine('কোনো module report এখনো generate হয়নি।', 10)
  }

  for (const report of reports) {
    addLine(report.title, 13, true, 4)
    // report.content markdown-এর মতো লেখা (# heading, - bullet) — এখানে
    // সাধারণ formatting সরিয়ে plain text হিসেবে দেখানো হচ্ছে, jsPDF-এ
    // markdown renderer নেই।
    const plainLines = report.content
      .split('\n')
      .map(l => l.replace(/^#+\s*/, '').replace(/\*\*/g, ''))
      .filter(l => l.trim().length > 0)

    for (const line of plainLines) {
      addLine(line, 9, false, 3)
    }
    y += 4
  }

  addLine(`তৈরি হয়েছে: ${new Date().toLocaleString('en-BD')} · CivilOS Hub`, 8, false, 0)

  return doc.output('blob')
}
