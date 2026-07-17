# CivilOS Hub — Phase 1-9 সম্পূর্ণ ডেলিভারি

এই zip-এ Phase 1 থেকে Phase 9 পর্যন্ত সব নতুন ও পরিবর্তিত ফাইল আছে,
প্রতিটার **সর্বশেষ সংস্করণ** (কোনো ফাইল একাধিক Phase-এ পরিবর্তিত হলেও
এখানে শুধু চূড়ান্ত/সবচেয়ে আপডেটেড কপি আছে)।

## কীভাবে বসাবে

এই zip-এর ভেতরের folder structure তোমার project-এর root-এর সাথে হুবহু
মিলে যায় (`lib/`, `components/`, `app/`, ইত্যাদি)। প্রতিটা ফাইল তার
নিজের path-এ কপি-পেস্ট করো, একইরকম আগে থেকে থাকা ফাইল থাকলে
প্রতিস্থাপন করো।

## ফাইল তালিকা (৪১টা)

### নতুন ফাইল (৩১টা)
```
lib/types/contract.types.ts
lib/types/dependency.types.ts
lib/types/approval.types.ts
lib/types/workflow.types.ts
lib/types/event.types.ts
lib/types/report.types.ts
lib/firestore/dependency.firestore.ts
lib/firestore/approval.firestore.ts
lib/firestore/workflow.firestore.ts
lib/firestore/event.firestore.ts
lib/firestore/report.firestore.ts
lib/firestore/module-data.firestore.ts
lib/hub-sdk.ts
lib/export/pdf-export.ts
lib/export/csv-export.ts
lib/export/zip-export.ts
components/integration/DependencyStatusCard.tsx
components/integration/ApprovalCard.tsx
components/integration/WorkflowProgressCard.tsx
components/integration/ActivityFeedCard.tsx
components/integration/ReportsCenterCard.tsx
components/integration/ExportCenterCard.tsx
PHASE1_NOTES.md ... PHASE9_NOTES.md (৯টা)
```

### পরিবর্তিত ফাইল (১০টা) — প্রতিস্থাপন করো
```
lib/types/integration.types.ts
lib/services/integration.service.ts
components/integration/AppExportCard.tsx
firestore.rules
lib/firestore/site-info.firestore.ts
lib/firestore/bnbc.firestore.ts
lib/firestore/building.firestore.ts
components/integration/EcosystemAppsCard.tsx
app/dashboard/projects/[id]/integration/page.tsx
package.json   ← ⚠️ নতুন dependency আছে (jspdf, jszip) — নিচে দেখো
```

## ⚠️ Deploy করার আগে ৩টা জিনিস

1. **`package.json` বদলেছে** — `jspdf` আর `jszip` নতুন dependency হিসেবে
   যোগ হয়েছে। GitHub-এ push করার পর Vercel নিজেই `npm install` চালিয়ে
   নেবে, তোমার আলাদা কিছু করতে হবে না।

2. **`firestore.rules` বদলেছে** (শুধু একটা comment যোগ হয়েছে
   `civilos_bridge`-এর ওপর, actual rule পাল্টায়নি) — চাইলে Firebase
   Console-এ আপডেট করে দিতে পারো, জরুরি না।

3. **Storage rules যাচাই করো (PHASE9_NOTES.md-এ বিস্তারিত)** — Firebase
   Console → Storage → Rules-এ গিয়ে দেখো wildcard rule আছে কিনা
   (`projects/{projectId}/{allPaths=**}`)। না থাকলে নতুন
   `moduleData` path-এর জন্য একটা rule যোগ করতে হবে — এই zip-এ
   `storage.rules.txt` নেই বলে আমি নিজে verify করতে পারিনি।

## প্রতিটা Phase কী করেছে (সংক্ষেপে)

বিস্তারিত জানতে সংশ্লিষ্ট `PHASE{N}_NOTES.md` পড়ো। সংক্ষেপে:

1. **Data Contract** — versioned envelope, shared entity types
2. **Version Dependency System** — module version tracking + ১টা genuine dependency edge (BNBC ← Site Info soilType)
3. **Approval System** — DRAFT→APPROVED workflow, auto-cascade OUTDATED
4. **Workflow Engine** — sequential project stage tracking (honestly capped at "প্রস্তুত, হস্তান্তরের অপেক্ষায়")
5. **Event Service** — real event log, ৭টা real-trigger event + ১৯টা future-app event vocabulary
6. **Hub SDK** — সব একত্রে `hub.xxx()` namespace-এ
7. **Report Center** — ৩টা real report generator (Site/BNBC/Building থেকে)
8. **Export Center** — PDF, CSV, Complete Package (ZIP) — নিরাপত্তার কারণে Excel বাদ (`xlsx`/`exceljs` vulnerable)
9. **Firestore Restructure** — migration না করার সুপারিশ + heavy-data-to-Storage pattern প্রস্তুত

## জানা সীমাবদ্ধতা (honest scope)

- Architectural/Structural/Estimating/Project Management App-এর নিজস্ব
  কোড এখনো এই Hub SDK ব্যবহার করে না — সেই App গুলোর zip আলাদাভাবে
  আপলোড করলে পরের ধাপে সেটা করা যাবে।
- `next@14.2.5`-এ একটা **critical-severity, সম্পর্কহীন** vulnerability
  পাওয়া গেছে (PHASE8_NOTES.md-এ বিস্তারিত) — এই ডেলিভারির স্কোপে ঠিক
  করা হয়নি, আলাদাভাবে দেখা দরকার হতে পারে।
