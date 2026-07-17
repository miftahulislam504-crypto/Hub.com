# Phase 2 — Version Dependency System

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/dependency.types.ts`
- `ModuleId` — এখন যে ৭টা module track করা হয়: Hub-এর নিজের ৩টা
  (`siteInfo`, `bnbcSettings`, `buildingInfo`) + ভবিষ্যতের ৪টা ecosystem app
  (`architectural`, `structural`, `estimating`, `projectmgmt`)।
- `ModuleVersionRecord` — প্রতি module-এর current version number।
- `ModuleDependency` — dependency edge shape (dependent module কোন upstream
  module-এর কোন version দেখেছিল)।
- `getDependencyStatus()` — upstream-এর বর্তমান version আর dependency তৈরির
  সময়ের version মিলিয়ে `CURRENT` বা `OUTDATED` বের করে।

### ২. নতুন ফাইল: `lib/firestore/dependency.firestore.ts`
নতুন দুটো subcollection ব্যবহার করে, প্ল্যানের section 12 (Firestore
Master Structure)-এ যেগুলো আগে থেকেই list করা ছিল:
- `projects/{projectId}/versions/{moduleId}` — version counter
- `projects/{projectId}/dependencies/{dependencyId}` — dependency edges

**Migration লাগেনি** — এগুলো pure নতুন subcollection, বিদ্যমান
`site_information`/`bnbc_settings`/`building_information` কাঠামো একদম
অক্ষত। `firestore.rules`-এ আগে থেকেই `match /{document=**}` wildcard আছে
`projects/{projectId}`-এর নিচে, তাই rules ফাইলে কোনো পরিবর্তন লাগেনি —
এটা যাচাই করে নিশ্চিত হয়েছি deploy করার আগে।

### ৩. পরিবর্তিত: তিনটা firestore save function
`site-info.firestore.ts`, `bnbc.firestore.ts`, `building.firestore.ts` —
প্রতিটার `saveXxx()` function-এ `setDoc(ref, payload)` এর পরপরই
`bumpModuleVersion()` কল বসানো হয়েছে। Version tracking fail হলেও মূল
save block হবে না (`try/catch` দিয়ে non-critical রাখা হয়েছে, ঠিক যেভাবে
আগে থেকেই activity_logs write করা হতো)।

### ৪. একটাই genuine dependency wire করা হয়েছে
`bnbc.firestore.ts`-এ save হওয়ার সময় এখন `bnbcSettings` module
`siteInfo`-এর ওপর একটা dependency link করে, কারণ **`bnbc.types.ts`-এর
কমেন্টেই আগে থেকে লেখা ছিল** — `soilType: 'S1'|'S2'|'S3'|'S4' // Soil
(linked from Site Info)`। এটা আমার বানানো সম্পর্ক না, কোডে
already-acknowledged একটা link, যেটা এখন পর্যন্ত শুধু কমেন্টে ছিল, কোনো
tracking logic ছিল না — এখন সেটা বাস্তবায়ন করা হলো।

**অন্য কোনো dependency fabricate করা হয়নি।** Site Info, BNBC, Building —
এই তিনটা এখনো মূলত independent facts about a project, একে অন্যের output
না (মূল প্ল্যানের section 8-এর dependency উদাহরণ ছিল Architecture→
Structural→Estimate পাইপলাইনের জন্য, Hub-এর নিজের ৩টা module-এর জন্য না)।
যখন Architectural/Structural/Estimating App গুলো shared model-এ আসবে
(Phase 5/6), তখন real pipeline dependency (Structural depends on
Architecture version X) এই একই `linkDependency()` function দিয়ে বসানো
যাবে — infrastructure এখন থেকেই প্রস্তুত।

### ৫. নতুন UI: `components/integration/DependencyStatusCard.tsx`
Integration page-এ (`/dashboard/projects/[id]/integration`)
`DataReadinessCard`-এর ঠিক পরে বসানো হয়েছে। এখন এটাতে একটাই সারি দেখাবে
(BNBC → Site Info), status `CURRENT`/`OUTDATED` সহ। শূন্য dependency
অবস্থায়ও graceful একটা "এখনো কিছু track হয়নি" মেসেজ দেখায়, ভাঙে না।

**⚠️ নামকরণ নোট:** এই কোডবেসের tab list-এ ইতিমধ্যেই নিজস্ব
"Phase 3/4/5/7/8" numbering আছে (Site Info=Phase 3, BNBC=Phase 4,
ইত্যাদি) — এটা সম্পূর্ণ আলাদা জিনিস, Hub-এর নিজের বিল্ড-অর্ডার লেবেল।
আমার "Phase 1/2/3..." হলো পুরো ecosystem-এর ৯-ধাপের রোডম্যাপ। দুটো
গুলিয়ে না ফেলতে নতুন UI-তে "Phase" শব্দটা এড়িয়ে যাওয়া হয়েছে
("Module Dependencies" লেখা হয়েছে, "Phase 2" না)।

**Build verified:** `npx tsc --noEmit` — Phase 1-এর সময় পাওয়া একই ৩টা
pre-existing, সম্পর্কহীন error ছাড়া নতুন কোনো error নেই।

---

## Phase 2 checklist — সব বন্ধ

- [x] প্রতিটা module data-তে version ফিল্ড (`versions/{moduleId}` collection)
- [x] Save হওয়ার সময় auto-increment logic (৩টা firestore file-এই বসানো)
- [x] Dependency map (`dependencies/{dependencyId}` collection + একটা
      genuine edge wire করা)
- [x] OUTDATED flag বসানোর লজিক (`getDependencyStatus()`)
- [x] Dependency graph UI (`DependencyStatusCard`)

**পরবর্তী: Phase 3 — Approval System।** এটা এখন Phase 2-এর ওপর সরাসরি
দাঁড়াবে — dependency `OUTDATED` হলে downstream module-এর approval status-ও
`OUTDATED`-এ রিসেট হওয়ার নিয়ম বসবে।
