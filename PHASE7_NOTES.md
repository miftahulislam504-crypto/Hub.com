# Phase 7 — Report Center

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/report.types.ts`
`ReportType` — প্ল্যানের section 10-এর **১৫টা report name হুবহু**
(Floor Area Report, Analysis Report, BOQ, Progress Report ইত্যাদি) + **৩টা
Hub-এর নিজের report** যেগুলো এখন সত্যিই generate হয় (site_info_summary,
bnbc_parameters_report, building_info_summary)। `REPORT_TYPES_BY_MODULE`
প্ল্যানের section 10-এর visual tree structure অনুযায়ী module-wise grouping।

### ২. নতুন ফাইল: `lib/firestore/report.firestore.ts`
- **Registry**: `registerReport()`, `getProjectReports()` —
  `projects/{projectId}/reports/{reportId}` এ লেখে, deterministic id
  (`RPT-{module}-{type}`) দিয়ে regenerate করলে overwrite হয় (Approval-এর
  মতো আলাদা history subcollection রাখা হয়নি — report একটা snapshot,
  পুরনো version রাখার প্রয়োজন নেই, শুধু `version` সংখ্যা বাড়ে)
- **৩টা genuine generator**: `generateSiteInfoSummary`,
  `generateBnbcParametersReport`, `generateBuildingInfoSummary` — এগুলো
  Site Info/BNBC/Building-এর **real, বর্তমান Firestore ডেটা পড়ে**, এবং
  BNBC-এর ক্ষেত্রে ইতিমধ্যে কোডে থাকা derived-calculation function গুলো
  (`getImportanceFactor`, `getSpectralAcceleration` ইত্যাদি, যেগুলো
  bnbc.types.ts-এ আগে থেকেই ছিল) ব্যবহার করে একটা প্রকৃত ডিজাইন-প্যারামিটার
  সারাংশ বানায়।

**⚠️ বাকি ১৫টা report type-এর একটারও generator নেই।** Architectural/
Structural/Estimating/PM App এখনো কোনো real ডেটা দেয় না, তাই "Floor Area
Report" বা "BOQ" generate করার মতো কিছু নেই। এগুলো শুধু type হিসেবে প্রস্তুত।

### ৩. নতুন event type: `REPORT_GENERATED`
(`lib/types/event.types.ts`-এ যোগ করা হলো)। প্রথমে ভুলবশত বিদ্যমান
`MODULE_STATUS_CHANGED` দিয়ে চালানোর চেষ্টা করেছিলাম, কিন্তু সেটা
approval-status বদলের জন্য নির্দিষ্ট — সেখানে overload করা ভুল হতো, তাই
নতুন, সঠিক event type যোগ করে ঠিক করা হলো।

### ৪. পরিবর্তিত: `lib/hub-sdk.ts`
Phase 6-এ যেখানে লেখা ছিল "registerReport() এখনো নেই, Phase 7-এর অপেক্ষায়"
— এখন সেটা real function দিয়ে প্রতিস্থাপিত। SDK-তে যোগ হলো:
`registerReport`, `getProjectReports`, আর ৩টা generator।

### ৫. নতুন UI: `components/integration/ReportsCenterCard.tsx`
Integration page-এ `ApprovalCard`-এর পরে বসানো হয়েছে (reports approved/
versioned ডেটা থেকে generate হয়, তাই এই ক্রম স্বাভাবিক)। প্ল্যানের visual
tree অনুযায়ী module-wise গোছানো:
- Hub-এর ৩টা module: real "তৈরি করুন"/"আবার তৈরি করুন" বাটন, generate
  হলে content expand করে দেখা যায় (markdown text, PDF না — সেটা Phase 8-এর
  কাজ)
- বাকি ৪টা (Architectural/Structural/Estimating/PM): প্রতিটা report name
  দেখা যায় (প্ল্যানের tree অনুযায়ী) কিন্তু honestly "কোনো ডেটা উৎস নেই"
  লেখা — কোনো fake বাটন বা fake progress না

**Build verified:** `npx tsc --noEmit` — একই ২টা pre-existing,
সম্পর্কহীন error ছাড়া নতুন কিছু নেই। Import-direction grep করে confirm
করা হয়েছে — শুধু `hub-sdk.ts` `report.firestore.ts` থেকে import করে,
কোনো cycle নেই। `firestore.rules`-এ কিছু লাগেনি।

---

## একটা সচেতন স্কোপ-সিদ্ধান্ত: PDF না, Markdown text

প্ল্যানের Report object shape (`reportId`, `version`, `sourceVersion`
ইত্যাদি) একটা **registry/metadata record**, ভারী content না — এটা
প্ল্যানের নিজের section 12 নীতির সাথেও মেলে ("Firestore: metadata/status/
reference/version/storagePath")। তাই এই Phase-এ report content ছোট
markdown text হিসেবে Firestore-এই রাখা হয়েছে, আলাদা PDF/DOCX ফাইল
generate করা হয়নি। **এটা scope-এড়ানো না — এটাই সঠিক phase বিভাজন:**
প্ল্যানের নিজের section 11 (Export Center) স্পষ্টভাবে PDF/Excel/CSV/
Complete Package বলে আলাদা কাজ হিসেবে তালিকাভুক্ত — সেটা Phase 8।

---

## Phase 7 checklist — সব বন্ধ

- [x] `reports` collection সক্রিয় (আগে rules-এ ছিল, কোড ছিল না — এখন
      সক্রিয়ভাবে ব্যবহৃত)
- [x] প্রতিটা app থেকে report register করার mechanism
      (`hub.registerReport()`, Phase 6-এর SDK দিয়ে)
- [x] Hub Reports UI — module-wise গোছানো তালিকা, প্ল্যানের tree অনুযায়ী
- [x] Report versioning `sourceVersion` দিয়ে (Phase 2-এর module version-এর
      সাথে যুক্ত — প্রতিটা generate করা report জানে কোন module-version
      থেকে বানানো হয়েছে)

**পরবর্তী: Phase 8 — Export Center।** এটা এখন এই Phase 7-এর registry-কে
ভিত্তি করে PDF/Excel/CSV এবং Complete Project Package বানাবে।
