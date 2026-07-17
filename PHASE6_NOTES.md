# Phase 6 — Hub SDK / App Gateway

## যা করা হলো

### নতুন ফাইল: `lib/hub-sdk.ts`
প্ল্যানের section 13-এর literal উদাহরণ অনুযায়ী একটা curated `hub`
namespace object — `hub.openProject()`, `hub.getApprovedArchitecture()`,
`hub.publishStructuralModel()`, `hub.emitEvent()`, `hub.getProjectDependencies()`
সহ Phase 1-5-এর প্রায় সব function।

**এই ফাইল কোনো নতুন লজিক লেখেনি** — Phase 1-5-এ যা বানানো হয়েছে
(`dependency.firestore.ts`, `approval.firestore.ts`, `workflow.firestore.ts`,
`event.firestore.ts`, `lib/firestore.ts`) সেগুলোর ওপর একটা পাতলা wrapper।
**ওই ৪টা ফাইল সম্পূর্ণ অপরিবর্তিত রাখা হয়েছে** — এটা ইচ্ছাকৃত, সবচেয়ে
কম-ঝুঁকির পথ: SDK যদি কোনো কারণে ভুল হয়, mechanism নিজে (dependency/
approval/workflow/event) সুরক্ষিত থাকে, সহজে রোলব্যাক করা যায়।

**নাম মেলানো:**
- `hub.getApprovedArchitecture(projectId)` → generic `getApprovedModule(projectId, 'architectural')`-এর thin wrapper
- `hub.publishStructuralModel(projectId, metadata?)` → generic `publishModule(projectId, 'structural', 'structural', metadata)`-এর thin wrapper
- `hub.registerReport()` — **যোগ করা হয়নি।** Report Center (Phase 7) এখনো
  ডিজাইন হয়নি। এখন stub বসালে ভুল shape হয়ে যেত, Phase 7-এ real design
  হওয়ার পর যোগ হবে।

### নতুন: `publishModule()` এবং `projects/{projectId}/moduleMetadata/{moduleId}`
প্ল্যানের section 12-এর নিজের নিয়ম মেনে — Hub ভারী engineering data
(geometry/mesh/analysis result) নিজে সংরক্ষণ করে না। `publishModule()`
শুধু version bump করে (Phase 2 mechanism পুনঃব্যবহার) এবং একটা ছোট
metadata reference (যেমন `storagePath`) `moduleMetadata` নামের নতুন,
pure-additive subcollection-এ রাখে।

### পরিবর্তিত: ৫টা UI component (শুধু import, কোনো লজিক বদলায়নি)
`ApprovalCard.tsx`, `DependencyStatusCard.tsx`, `WorkflowProgressCard.tsx`,
`EcosystemAppsCard.tsx`, `ActivityFeedCard.tsx` — এখন `@/lib/hub-sdk`
থেকে `hub` import করে, ৪টা আলাদা `*.firestore.ts` ফাইল থেকে সরাসরি না।
Type import (যেমন `UnlockStatus`, `DependencyWithStatus`, `HubEvent`)
সরাসরি তাদের মূল ফাইল থেকেই রয়ে গেছে — এগুলো Firestore-path হার্ডকোডিং-এর
বিষয় না, তাই SDK-তে টানার দরকার নেই।

**Build verified:** `npx tsc --noEmit` — একই ২টা pre-existing,
সম্পর্কহীন error ছাড়া নতুন কিছু নেই। Import-direction আবার manually
grep করে confirm করা হয়েছে — `hub-sdk.ts` শুধু নিচের দিকে (৪টা firestore
service + project CRUD) import করে, কোনো ফাইল উল্টো দিকে `hub-sdk.ts`
import করে না (UI component ছাড়া), তাই কোনো cycle নেই।

---

## ⚠️ সবচেয়ে গুরুত্বপূর্ণ honest scope-note

**এই SDK এখন পর্যন্ত শুধু Hub-এর নিজের ৫টা UI component ব্যবহার করছে।**
Architectural/Structural/Estimating/PM App — এই ৪টা আলাদা codebase,
আলাদা Vercel deployment (`enginex-structural.vercel.app` ইত্যাদি), এই
zip-এ নেই। তাদের কোড আমি দেখিনি, তাই তাদের ভেতরে `hub.xxx()` কল বসানো
এই সেশনে সম্ভব ছিল না।

**প্ল্যানের আসল লক্ষ্য ছিল:** "এর ফলে চারটা app-এ আলাদা আলাদা Firebase
logic লিখতে হবে না" — এটা তখনই পুরোপুরি সত্য হবে যখন *সেই চারটা app*-এর
কোড এই SDK ব্যবহার করবে, শুধু Hub নিজে না।

**পরবর্তী ধাপ (যখন প্রস্তুত):** Structural App-এর (বা অন্য যেকোনো
App-এর) zip আপলোড করলে, এই একই `lib/hub-sdk.ts` ফাইল সেই প্রজেক্টে কপি
করে বসানো যাবে, এবং সেই App-এর ভেতরে যেখানে raw Firestore path হার্ডকোড
করা আছে (যেমন `structuralData/civp` লেখার জায়গা), সেখানে `hub.publishStructuralModel()`
কল বসানো যাবে। এটা এই phase-এর স্বাভাবিক continuation, নতুন design লাগবে
না — infrastructure প্রস্তুত।

---

## Phase 6 checklist

- [x] `hub.openProject()`, `hub.emitEvent()`, `hub.getProjectDependencies()`
      ইত্যাদি — একটা shared SDK namespace (`lib/hub-sdk.ts`)
- [x] Hub-এর নিজের কোড এখন raw Firestore path সরাসরি hardcode না করে SDK
      ব্যবহার করে (৫টা UI component)
- [~] **বাকি ৪টা App-এর নিজের কোড SDK ব্যবহার করা** — সম্ভব হয়নি এই
      সেশনে, কারণ তাদের কোড এই zip-এ নেই। পরের বার সেই App-এর zip
      আপলোড করলে এই একই SDK সেখানে বসানো যাবে।

**পরবর্তী: Phase 7 — Report Center।** এটা `hub.registerReport()`-এর
real design ঠিক করবে, তারপর SDK-তে যোগ হবে।
