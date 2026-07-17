# Phase 8 — Export Center

## ⚠️ সবচেয়ে গুরুত্বপূর্ণ সিদ্ধান্ত — এই Phase-এ প্রথমবার নতুন npm dependency

এই Phase-এই প্রথম কোনো নতুন library যোগ করা হলো (আগের ৭টা Phase শুধু
বিদ্যমান Firebase SDK দিয়ে কাজ করেছে)। তাই এবার সরাসরি `npm install`
চালিয়ে বাস্তবে verify করা হয়েছে — শুধু `tsc` পাস করা যথেষ্ট মনে করা
হয়নি।

**যা ঘটেছিল:**
1. প্ল্যানের "Excel" export-এর জন্য প্রথমে `xlsx` (SheetJS) install করা
   হয়েছিল। `npm audit` **high-severity, no-fix-available** vulnerability
   ধরেছে (Prototype Pollution + ReDoS)।
2. বিকল্প হিসেবে `exceljs` চেষ্টা করা হয়েছিল — সেটাও vulnerable `uuid`
   dependency আনছিল।
3. **সিদ্ধান্ত: কোনোটাই ব্যবহার করা হয়নি।** এর বদলে "Excel" export
   **CSV** হিসেবে বানানো হয়েছে — কোনো library লাগে না (pure string),
   এবং CSV Excel/Google Sheets/LibreOffice-এ সমানভাবে খোলে। ব্যবহারকারীর
   জন্য practical ফলাফল একই, নিরাপত্তা ঝুঁকি শূন্য।
4. `jspdf` (PDF) আর `jszip` (ZIP) আলাদাভাবে audit করে **clean** পাওয়া
   গেছে — এই দুটোই রাখা হয়েছে।

**দুটোই বাস্তবে চালিয়ে smoke-test করা হয়েছে** (শুধু `tsc --noEmit` না) —
`jszip` দিয়ে সত্যিকারের zip বানিয়ে round-trip read করে ফোল্ডার-structure
নিশ্চিত করা হয়েছে, `jspdf` দিয়ে সত্যিকারের PDF বানিয়ে valid `%PDF` header
নিশ্চিত করা হয়েছে।

### `package.json`-এ যোগ হলো
```
"jspdf": "^4.2.1"
"jszip": "^3.10.1"
```
Deploy করার সময় Vercel স্বয়ংক্রিয়ভাবে `npm install` চালাবে — আলাদা কিছু
করার দরকার নেই।

### একটা সম্পর্কহীন কিন্তু গুরুত্বপূর্ণ পর্যবেক্ষণ
`npm audit` চালানোর সময় দেখা গেছে **`next@14.2.5`-এ critical-severity
vulnerability আছে** (একাধিক CVE — cache poisoning, SSRF, DoS)। **এটা
Phase 8-এর সাথে সম্পর্কহীন, আমার কোনো পরিবর্তনের কারণে না** — এই zip
আপলোড করার আগে থেকেই ছিল। যেহেতু severity critical, এটা আলাদাভাবে
জানিয়ে রাখা দরকার মনে করছি, যদিও এই Phase-এর scope-এ এটা ঠিক করা
হয়নি (আলাদা upgrade path লাগবে, breaking change হতে পারে — চাইলে
আলাদা সেশনে দেখতে পারি)।

---

## যা করা হলো

### নতুন ফাইল: `lib/export/pdf-export.ts`
`generateProjectPDF()` — Project header + Hub-এর ৩টা real module report
(Phase 7) নিয়ে formatted PDF বানায় jsPDF দিয়ে। Export button চাপলে
reports **fresh regenerate** হয় (আগে generate করা থাকলেও), তাই PDF-এ
সবসময় সর্বশেষ ডেটা থাকে।

### নতুন ফাইল: `lib/export/csv-export.ts`
`generateEventsCSV()` — কোনো library ছাড়া pure string formatting।
Activity Log (Phase 5-এর event log)-কে CSV বানায় — এটাই এখন পর্যন্ত
সবচেয়ে genuinely tabular real data।

### নতুন ফাইল: `lib/export/zip-export.ts`
`generateProjectPackage()` — প্ল্যানের section 11-এর ঠিক folder structure:
```
/project (real: project-info.json, site-info.json, bnbc-settings.json, building-info.json)
/architecture, /structural, /estimate, /management (NOTE.txt — honestly বলে কেন খালি)
/reports (real generated reports, .md ফাইল হিসেবে)
/project-manifest.json (সারাংশ)
```

### পরিবর্তিত: `lib/services/integration.service.ts`
`downloadBlob()` আর `downloadCSV()` যোগ হলো — বিদ্যমান `downloadJSON()`-এর
same Blob+anchor pattern পুনর্ব্যবহার করে, ডুপ্লিকেট না করে।

### নতুন UI: `components/integration/ExportCenterCard.tsx`
পুরনো inline "সম্পূর্ণ JSON Download" card-টা প্রতিস্থাপিত (page-এ আলাদা
component হিসেবে ছিল না, এখন বাকি সব section-এর মতো নিজস্ব ফাইলে)। প্ল্যানের
checkbox list (Project Information, Architectural, Structural, BOQ, Cost
Estimate, Project Schedule, Progress) দেখানো হয়েছে — শুধু "Project
Information"-এ real data (✓ সবুজ), বাকি ৬টা honestly disabled/ধূসর।
JSON/PDF/CSV/Complete Package — ৪টা বাটন।

### পরিবর্তিত: `app/dashboard/projects/[id]/integration/page.tsx`
পুরনো inline export card সরিয়ে `<ExportCenterCard>` বসানো হলো, সাথে
এখন-অব্যবহৃত `handleFullDownload`/`lastExport`/import পরিষ্কার করা হলো।
`project` (Zustand store থেকে) load না হওয়া পর্যন্ত ছোট loading state
দেখায়, যেহেতু PDF/ZIP-এর জন্য পুরো `Project` object দরকার (`payload`-এ
শুধু projectCode/projectName আছে, clientName/location নেই)।

**Build verified:** `npx tsc --noEmit` — একই ২টা pre-existing,
সম্পর্কহীন error ছাড়া নতুন কিছু নেই। এছাড়া `jszip`/`jspdf` বাস্তবে
চালিয়ে output verify করা হয়েছে (ওপরে বর্ণিত)।

---

## Phase 8 checklist — সব বন্ধ (একটা সচেতন format-পরিবর্তন সহ)

- [x] Single JSON export থেকে multi-format-এ বৃদ্ধি — **PDF, CSV**
      (Excel-এর বদলে, নিরাপত্তার কারণে — ওপরে ব্যাখ্যা করা হয়েছে), **JSON**
- [x] Checkbox-based selective UI — দেখানো হয়েছে, honestly শুধু যেটা
      real তা enabled
- [x] Complete Project Package (ZIP) — প্ল্যানের ঠিক folder structure সহ
- [x] Phase 7-এর Report Center থেকে reports pull করে package-এ যোগ

**সব ৮টা Phase সম্পন্ন হলো।** পরবর্তী ধাপ (Phase 9, "Firestore Master
Structure পুনর্বিন্যাস") সবচেয়ে বড় migration risk হিসেবে ইচ্ছাকৃতভাবে
শেষে রাখা হয়েছিল — চাইলে সেটা নিয়ে এগোতে পারি, অথবা এখন যা বানানো
হয়েছে সেটা প্রথমে deploy করে test করে দেখতে পারো।
