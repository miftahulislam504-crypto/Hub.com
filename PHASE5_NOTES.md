# Phase 5 — Event Service

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/event.types.ts`
`HubEventType` — প্ল্যানের section 3,4,5,6-এর সব **১৯টা event name হুবহু**
(ARCH_MODEL_APPROVED, STRUCT_DESIGN_APPROVED, BOQ_GENERATED,
PROJECT_COMPLETED ইত্যাদি) + **৭টা Hub internal event** (Phase 2/3/4-এর
real trigger থেকে, প্ল্যানে নাম ছিল না — MODULE_VERSION_BUMPED,
MODULE_APPROVED, WORKFLOW_STAGE_CHANGED ইত্যাদি)।

**⚠️ ১৯টার একটাও এখনো real emit হয় না** — Architectural/Structural/
Estimating/PM App এখনো Hub-এর shared model-এ যুক্ত হয়নি। এগুলো শুধু
type হিসেবে প্রস্তুত রাখা হলো, ভবিষ্যতে সঠিক নাম যেন অনুমান করতে না হয়।

### ২. নতুন ফাইল: `lib/firestore/event.firestore.ts`
- `emitEvent()` — `projects/{projectId}/events/{eventId}` এ লেখে (প্ল্যান
  section 12-এ আগে থেকেই list করা subcollection)
- `getProjectEvents()` — one-time read
- `subscribeToEvents()` — **realtime**, `onSnapshot` দিয়ে
- `subscribeToAppTouched()` — Structural existence-check-এর realtime সংস্করণ

**এই ফাইলটা ইচ্ছাকৃতভাবে "clean"** — dependency/approval/workflow
firestore ফাইলগুলোর কোনোটা থেকেই import করে না, যাতে ওই তিনটা এখান
থেকে import করলে circular dependency তৈরি না হয়। যাচাই করে নিশ্চিত
হয়েছি (`grep` দিয়ে import direction check করে) — সবগুলো একমুখী,
কোনো cycle নেই।

### ৩. পরিবর্তিত: `lib/firestore/dependency.firestore.ts`
`bumpModuleVersion()` → এখন `MODULE_VERSION_BUMPED` emit করে।
`linkDependency()` → এখন `MODULE_DEPENDENCY_LINKED` emit করে।

### ৪. পরিবর্তিত: `lib/firestore/approval.firestore.ts`
`setApprovalStatus()`-এর ভেতরে **একটাই emit পয়েন্ট** — status অনুযায়ী
সবচেয়ে specific event বেছে নেয় (APPROVED→MODULE_APPROVED,
REJECTED→MODULE_REJECTED, OUTDATED→MODULE_OUTDATED, বাকি সব→
MODULE_STATUS_CHANGED)। যেহেতু `downgradeToOutdatedIfApproved`
(Phase 3-এর system cascade) নিজেও এই একই function কল করে, **মানুষের
ক্লিক আর system-এর auto-downgrade দুটোই স্বয়ংক্রিয়ভাবে event emit করে**,
আলাদা করে emit call ছড়িয়ে দিতে হয়নি।

### ৫. পরিবর্তিত: `lib/firestore/workflow.firestore.ts`
নতুন: `checkAndEmitStageTransition()` — এটাই এখন UI ব্যবহার করে,
`deriveWorkflowState` সরাসরি না। কাজ: `deriveWorkflowState` কল করে,
তারপর `projects/{projectId}/workflow/state`-এ (প্ল্যানের subcollection,
প্রথমবার ব্যবহার হলো) গত জানা stage-এর সাথে তুলনা করে — **শুধু সত্যিই
বদলালে** (এগোনো বা পিছানো, দুটোই) `WORKFLOW_STAGE_CHANGED` emit করে
এবং নতুন stage persist করে।

**কেন এভাবে, সরাসরি `deriveWorkflowState`-এ emit বসাইনি কেন:**
`deriveWorkflowState` pure/derived — প্রতিবার fresh হিসাব করে, প্রতিটা
page-load-এ কল হয়। যদি সরাসরি সেখানে emit বসাতাম, প্রতিবার কেউ
Integration page খুললে event log ভরে যেত একই "no change" এন্ট্রি দিয়ে।
তাই একটা ছোট persisted "last known stage" রেকর্ড রাখা হয়েছে যেটা শুধু
প্রকৃত পরিবর্তনেই emit করে।

### ৬. পরিবর্তিত: `components/integration/EcosystemAppsCard.tsx`
**One-time check থেকে realtime upgrade** (checklist item: "App
Registry-কে event-driven করা")। আগে mount হলে একবার `getDoc` চেক হতো;
এখন প্রতিটা App-এর জন্য আলাদা `onSnapshot` subscription — Structural
App যদি এই পেজ খোলা অবস্থায় কখনো লেখে, UI সাথে সাথে বদলে যাবে, refresh
লাগবে না। সব subscription-এর unsubscribe function সংগ্রহ করে
cleanup-এ কল করা হয় (memory leak এড়াতে)।

### ৭. নতুন UI: `components/integration/ActivityFeedCard.tsx`
Integration page-এ সবার নিচে (EcosystemAppsCard-এর পরে) বসানো হয়েছে।
`subscribeToEvents` দিয়ে সাম্প্রতিক ১৫টা event realtime দেখায় — এখন
থেকে Site Info/BNBC/Building-এ কাজ করলে, Approve/Reject করলে, এই
feed-এ সত্যিকারের entry দেখা যাবে।

### ৮. পরিবর্তিত: `app/dashboard/projects/[id]/integration/page.tsx`
`ActivityFeedCard` mount করা হলো।

**Build verified:** `npx tsc --noEmit` — আগের ২টা pre-existing,
সম্পর্কহীন error ছাড়া নতুন কিছু নেই। Import-direction manually
grep করে confirm করা হয়েছে কোনো cycle নেই। `firestore.rules`-এ
কিছু লাগেনি (একই wildcard আগে থেকেই cover করে)।

---

## Phase 5 checklist — সব বন্ধ

- [x] Event emit/listen infrastructure — ১৯টা plan-defined event type
      প্রস্তুত (এখনো emit হয় না, honestly বলা আছে), + ৭টা Hub internal
      event সত্যিই এখন emit হচ্ছে (real trigger থেকে)
- [x] App Registry event-driven — `EcosystemAppsCard` one-time থেকে
      realtime `onSnapshot`-এ upgrade
- [ ] বাকি ৪টা app-এর checkPath — **ইচ্ছাকৃতভাবে এখনো বসানো হয়নি।**
      Phase 4-এর মতোই কারণ: ভুল document-id guess করলে সেটা "কোনো
      সংকেত নেই"-এর চেয়ে খারাপ (একটা fake-negative check যেটা দেখতে
      real মনে হয় কিন্তু আসলে ভুল path দেখছে)। যখন সেই App গুলোর real
      collection/doc convention নিশ্চিত হবে (হয় তুমি বলে দিলে, নয়তো
      সেই App-এর কোড দেখে), তখনই বসানো হবে।

**পরবর্তী: Phase 6 — Hub SDK / App Gateway।** এটা এখন Phase 1-5-এর
সবকিছু (contract, version, dependency, approval, workflow, event) —কে
একটা একক SDK-তে wrap করবে, যাতে বাইরের App গুলো Hub-এর internal
Firestore path সরাসরি না জেনেই কথা বলতে পারে।
