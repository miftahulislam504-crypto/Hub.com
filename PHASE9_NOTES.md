# Phase 9 — Firestore Master Structure পুনর্বিন্যাস

## ⚠️ সিদ্ধান্ত ১: Collection migration করা হয়নি — সুপারিশ করছি না করার জন্যও

প্ল্যানের section 12 চেয়েছিল বর্তমান নেস্টেড structure
(`projects/{id}/site_information`, `bnbc_settings`, `building_information`)
থেকে আলাদা top-level collection-এ (`projectArchitecture/{projectId}`,
`projectStructural/{projectId}` ইত্যাদি) সরানো।

**এটা করা হয়নি, এবং না করার সুপারিশ করছি:**

1. **আমি এই migration চালাতে পারতাম না এমনিতেই।** আমার কাছে শুধু তোমার
   কোডের zip আছে, তোমার আসল লাইভ Firestore ডেটাবেজে কোনো access নেই।
   Migration script লিখলেও সেটা *তোমাকে* Node + Firebase Admin SDK
   credentials দিয়ে চালাতে হতো — যেটা তোমার phone-based workflow-এর
   সাথে একদমই মেলে না।
2. **বাস্তব সুবিধা নেই তোমার বর্তমান পরিস্থিতিতে।** Top-level আলাদা
   collection-এর মূল সুবিধা হলো ভিন্ন App/টিমের জন্য আলাদা access
   boundary — কিন্তু তুমি একাই সব App বানাচ্ছ। এই decoupling এখন কোনো
   বাস্তব সমস্যা সমাধান করে না।
3. **ঝুঁকি অসামঞ্জস্যপূর্ণ।** এটা তোমার লাইভ, deployed, real project data
   থাকা সিস্টেমে migration — ভুল হলে ডেটা হারানোর ঝুঁকি, আর লাভ প্রায়
   শূন্য।
4. বর্তমান নেস্টেড কাঠামো ইতিমধ্যে `{document=**}` wildcard rule দিয়ে
   cover করা, এবং Phase 1-8 এর সব নতুন subcollection (versions,
   dependencies, approvals, events, reports, moduleMetadata) এর ওপর
   নির্বিঘ্নে বসে গেছে।

**আমার সুপারিশ:** বর্তমান structure রাখো। ভবিষ্যতে যদি সত্যিই আলাদা টিম
বা সম্পূর্ণ স্বতন্ত্র App কোনো কারণে আলাদা top-level access boundary
দাবি করে, তখনই এটা পুনর্বিবেচনা করা যুক্তিসঙ্গত হবে — এখন না।

---

## সিদ্ধান্ত ২: Heavy data → Storage — নতুন, forward-looking infrastructure

প্ল্যানের দ্বিতীয় অংশ ("Large Geometry, Analysis Matrix, Mesh, Generated
PDF/Excel — এগুলো Firebase Storage-এ থাকবে, Firestore-এ শুধু metadata/
reference/storagePath") **কোনো existing data migrate না করেই বাস্তবায়ন
করা সম্ভব ছিল** — কারণ Hub-এ এখনো কোনো "heavy" engineering data নেই
(Site Info/BNBC/Building সবই ছোট structured record)। তাই এটা শুধু
ভবিষ্যতের জন্য প্রস্তুত করা infrastructure।

### নতুন ফাইল: `lib/firestore/module-data.firestore.ts`
`uploadModuleData()` — **`document.firestore.ts`-এর (Documents ফিচার,
আগে থেকেই কাজ করছে) হুবহু প্রমাণিত pattern অনুসরণ করে।** নতুন কিছু
আবিষ্কার করা হয়নি, বরং বিদ্যমান কাজ-করা pattern পুনর্ব্যবহার করা হয়েছে:
- Storage path: `projects/{projectId}/moduleData/{moduleId}/{timestamp}_{filename}`
- Firestore-এ শুধু reference (`storagePath`, `fileUrl`, `fileSize` ইত্যাদি)
  — heavy bytes কখনো Firestore-এ যায় না
- Upload-এর পর `bumpModuleVersion()` (Phase 2) কল হয়, তাই cascade/event
  সবকিছু স্বয়ংক্রিয়ভাবে কাজ করে

### পরিবর্তিত: `lib/hub-sdk.ts`
`hub.uploadModuleData()`, `hub.getModuleDataFile()` যোগ হলো।

---

## ⚠️ গুরুত্বপূর্ণ আবিষ্কার: `storage.rules.txt` এই zip-এ নেই

`DEPLOYMENT.md`-এ স্পষ্ট নির্দেশনা আছে: *"Storage → Rules →
storage.rules.txt এর content paste করুন"* — কিন্তু **এই ফাইলটা এই zip-এ
কোথাও নেই।** মানে তোমার আসল Storage security rules Firebase Console-এ
সরাসরি configured, এই কোডবেসে ট্র্যাক করা হয় না (অথবা ফাইলটা zip করার
সময় বাদ পড়ে গেছে)।

**এর ব্যবহারিক প্রভাব:** `document.firestore.ts`-এর Documents ফিচার
`projects/{projectId}/documents/...` পাথে আপলোড করে এবং কাজ করছে বলে
জানি, তাই সেই path নিশ্চয়ই deployed rules-এ অনুমোদিত। কিন্তু আমার নতুন
`uploadModuleData()` ভিন্ন path ব্যবহার করে
(`projects/{projectId}/moduleData/...`)। **যদি তোমার deployed Storage
rules একটা wildcard হয়** (যেমন `match /projects/{projectId}/{allPaths=**}`),
তাহলে নতুন path এমনিতেই কাজ করবে। **যদি rules সরাসরি `documents/` পাথে
সীমাবদ্ধ হয়**, নতুন path কাজ করবে না যতক্ষণ না rule যোগ করা হয়।

**আমি speculative পুরো `storage.rules.txt` লিখে দিইনি** — কারণ আমি জানি
না তোমার বর্তমান rules-এ ঠিক কী আছে (ফাইল-সাইজ সীমা, ফাইল-টাইপ চেক
ইত্যাদি থাকতে পারে যেটা আমি না জেনে ভুলভাবে প্রতিস্থাপন করে ফেলতাম)।
তার বদলে, Firebase Console → Storage → Rules-এ গিয়ে **তোমার বর্তমান
rules দেখো** — যদি এরকম একটা wildcard blocks থাকে:
```
match /projects/{projectId}/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```
তাহলে কিছু করার দরকার নেই। যদি না থাকে, নিচের block-টা তোমার বিদ্যমান
rules-এর ভেতরে (অন্য সব rule-এর পাশে, প্রতিস্থাপন না করে) যোগ করো:
```
match /projects/{projectId}/moduleData/{moduleId}/{fileName} {
  allow read, write: if request.auth != null;
}
```

---

## Phase 9 checklist

- [~] Collection migration — **সচেতনভাবে করা হয়নি**, না করার সুপারিশ সহ
      (ওপরে বিস্তারিত ব্যাখ্যা)
- [x] Heavy data → Storage pattern — নতুন, প্রমাণিত pattern পুনর্ব্যবহার
      করে বাস্তবায়িত
- [!] **নতুন আবিষ্কার**: `storage.rules.txt` zip-এ অনুপস্থিত — Firebase
      Console-এ ম্যানুয়াল যাচাই দরকার (ওপরে নির্দেশনা)

---

# 🎉 সব ৯টা Phase সম্পন্ন

Phase 1-9 জুড়ে যা বাস্তবায়িত হয়েছে তার সারসংক্ষেপ:

| Phase | মূল বিষয় | অবস্থা |
|---|---|---|
| 1 | Data Contract | ✅ সম্পূর্ণ |
| 2 | Version Dependency System | ✅ সম্পূর্ণ (১টা genuine dependency edge) |
| 3 | Approval System | ✅ সম্পূর্ণ (soft lock, hard block না) |
| 4 | Workflow Engine | ✅ সম্পূর্ণ (honestly PREREQUISITES_READY পর্যন্ত) |
| 5 | Event Service | ✅ সম্পূর্ণ (৭টা real event emit হয়) |
| 6 | Hub SDK | ✅ সম্পূর্ণ (Hub নিজে ব্যবহার করে, বাকি ৪ App বাকি) |
| 7 | Report Center | ✅ সম্পূর্ণ (৩টা real report generator) |
| 8 | Export Center | ✅ সম্পূর্ণ (PDF/CSV/ZIP, নিরাপত্তার কারণে Excel বাদ) |
| 9 | Firestore Restructure | ✅ আংশিক — migration না করার সুপারিশ, Storage pattern বাস্তবায়িত |

**সবচেয়ে বড় বাকি কাজ (এই zip দিয়ে সম্ভব ছিল না):** Architectural/
Structural/Estimating/Project Management App-এর নিজস্ব কোড এই Hub SDK
ব্যবহার করা শুরু করা। সেটার জন্য সেই App গুলোর zip আলাদাভাবে আপলোড করে
কাজ করা লাগবে।
