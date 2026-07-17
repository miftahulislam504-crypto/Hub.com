# Phase 4 — Workflow Engine

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/workflow.types.ts`
- `WorkflowStage` — প্ল্যানের ৯টা স্টেজ + **একটা সংযোজন**: `PREREQUISITES_READY`
- `WORKFLOW_STAGE_ORDER`, `WORKFLOW_STAGE_LABELS_BN`
- `APP_CHECK_PATHS` — centralized checkPath mapping (আগে `EcosystemAppsCard.tsx`-এ
  hardcoded ছিল)

**⚠️ `PREREQUISITES_READY` স্টেজটা মূল প্ল্যানে ছিল না — আমার সংযোজন,
খোলাখুলি বলে রাখছি।** কারণ: Hub-এর ৩টা module (Site Info, BNBC, Building)
আসলে "Architecture Started" না — এগুলো Architecture App-কে *দেওয়ার জন্য*
raw ingredient (প্ল্যানের section 3-এ যা তালিকাভুক্ত)। এই ৩টা approved
হওয়াকে সরাসরি "Architecture Started" বলা মিথ্যা claim হতো। তাই একটা সৎ
intermediate স্টেজ যোগ করা হলো যেটা শুধু বলে: "Hub-এর অংশ শেষ, হস্তান্তরের
জন্য প্রস্তুত" — এর বেশি দাবি করে না।

### ২. নতুন ফাইল: `lib/firestore/workflow.firestore.ts`
- **`deriveWorkflowState(projectId)`** — কড়াভাবে sequential। Hub-এর ৩টা
  module সব `APPROVED` (শুধু "filled" না — কেন APPROVED? প্ল্যানের নিজের
  শেষ নিয়ম: *"Approved Data flows through Hub"*) হলে `PREREQUISITES_READY`
  পর্যন্ত পৌঁছায়। **এর পরে honestly থেমে যায়** — কারণ Architecture App
  থেকে কোনো approval signal আসে না এখনো (কোনো contract/SDK নেই, Phase 5/6
  বাকি)।
- **`checkAppTouched(projectId, checkPath)`** — আগে `EcosystemAppsCard.tsx`-এর
  ভেতরে duplicate করা ছিল এই existence-check লজিক, এখন centralize করা
  হলো।

### ৩. নতুন UI: `components/integration/WorkflowProgressCard.tsx`
Integration page-এ **সবার ওপরে** বসানো হয়েছে (সবচেয়ে macro-level summary
বলে)। দুইটা আলাদা অংশ — **ইচ্ছাকৃতভাবে আলাদা রাখা হয়েছে, একসাথে মেশানো
হয়নি:**

1. **Sequential stepper** — প্ল্যানের ১০টা স্টেজ, ✓/○ দিয়ে। এখন বাস্তবে
   প্রায় সব প্রজেক্টেই `PROJECT_CREATED`-এ থেমে থাকবে (যতক্ষণ না তুমি
   ApprovalCard দিয়ে ৩টা module সত্যিই Approve করছ) — এটাই সঠিক, honest
   অবস্থা।
2. **App-ভিত্তিক সংকেত** — Architectural/Structural/Estimating/PM-এর জন্য।
   **এখানে সংখ্যায় % দেখানো হয়নি ইচ্ছাকৃতভাবে।** মূল প্ল্যানে
   "Architecture 100%, Structural 70%" ধরনের percentage bar-এর কথা ছিল
   (section 2-এর "App Registry" sub-block, "Workflow Engine" sub-block
   থেকে আলাদা একটা concept — দুটো একসাথে গুলিয়ে ফেলা হয়েছিল আমার আগের
   Phase 4 roadmap বর্ণনায়, এখন আলাদা করা হলো)। কিন্তু এই ৪টা App-এর
   জন্য এখন **কোনো real progress-reporting mechanism নেই** — Structural-এর
   জন্য শুধু binary existence-check আছে (touched/না), বাকি ৩টার তো
   সেটাও নেই। কোনো সংখ্যা বসালে সেটা fabricated হতো, তাই তিনটা discrete
   অবস্থা দেখানো হয়েছে: "ছোঁয়া হয়েছে" / "যাচাই করা হয়েছে — এখনো না" /
   "কোনো সংকেত নেই"।

**একটা গুরুত্বপূর্ণ ব্যাখ্যা — কেন Structural "touched" দেখালেও Workflow
স্টেজ এগোয় না:** `EcosystemAppsCard`-এ Structural "এই App-এ project
খোলা হয়েছে" দেখাতে পারে, কিন্তু `WorkflowProgressCard`-এর sequential
chain তখনও `PREREQUISITES_READY`-তে আটকে থাকবে। এটা bug না — প্ল্যানের
নিজের নিয়ম হলো Architecture Approved না হলে Structural Ready আসতে পারে
না, তুমি সরাসরি Structural App-এ গিয়ে কাজ করলেও (out-of-band) formal
workflow সেটাকে "reached" বলবে না। দুটো signal ইচ্ছাকৃতভাবে আলাদা রাখা
হয়েছে: EcosystemAppsCard = informal raw touch-check, WorkflowProgressCard
= formal gated pipeline।

### ৪. পরিবর্তিত: `components/integration/EcosystemAppsCard.tsx`
রিফ্যাক্টর — এখন নিজের ভেতরে existence-check duplicate না করে
`workflow.firestore.ts`-এর `checkAppTouched` আর `workflow.types.ts`-এর
`APP_CHECK_PATHS` ব্যবহার করে। **আচরণ অপরিবর্তিত** (pure refactor)।

**Bonus fix (আলাদা করে বলে রাখছি, silent bundle করিনি):** এই ফাইলে একটা
pre-existing TypeScript error ছিল (`TS1355` — `as const` একটা ternary-এর
ওপর বসানো, যেটা invalid) যেটা Phase 1 থেকেই "সম্পর্কহীন" হিসেবে touch
করিনি। যেহেতু এবার এই ফাইলটাই refactor করতে হচ্ছিল, একই সাথে এই bug-টাও
ঠিক করে দেওয়া হলো — union-typed variable দিয়ে, `as const` সরিয়ে।

### ৫. পরিবর্তিত: `app/dashboard/projects/[id]/integration/page.tsx`
`WorkflowProgressCard` mount করা হলো সবার ওপরে।

**Build verified:** `npx tsc --noEmit` — আগে ৩টা pre-existing error ছিল,
এখন ২টা (`EcosystemAppsCard`-এরটা ঠিক হয়ে যাওয়ায়)। বাকি ২টা
(`dashboard/page.tsx`, `LanguageProvider.tsx`) এখনো সম্পর্কহীন, touch
করিনি।

---

## যা করা হয়নি এবং কেন (honest scope note)

**"প্রতিটা app-এ gate বসানো"** — Hub-এর নিজের কোনো UI hard-lock হয়নি।
`deriveWorkflowState` real check করে এবং সত্যিই থেমে যায়, কিন্তু এটা কোনো
tab/form disable করে না (Phase 3-এর মতো একই সিদ্ধান্ত — solo workflow-এ
friction যোগ করার মানে নেই)। এছাড়া, Architecture/Structural App গুলো
**Hub-এর বাইরে আলাদা deployed URL** (enginex-structural.vercel.app
ইত্যাদি) — Hub-এর কোনো টেকনিক্যাল উপায় নেই সেই App গুলোর নিজস্ব route
literally ব্লক করার। সত্যিকারের enforcement তখনই সম্ভব হবে যখন সেই App
গুলো নিজেরা Hub-কে জিজ্ঞেস করবে (Phase 6-এর SDK গৃহীত হলে) — এটা
একতরফাভাবে Hub থেকে চাপিয়ে দেওয়া সম্ভব না।

---

## Phase 4 checklist — সব বন্ধ (একটা honest scope-limitation সহ)

- [x] Project-level workflow state মডেল (`WorkflowStage` enum, ordered)
- [x] Phase 3-এর approval status থেকে auto-derive (`deriveWorkflowState`)
- [~] App-এ gate — real check function আছে (`deriveWorkflowState`-এর
      blockedReason), কিন্তু hard enforcement Phase 6 SDK-এর অপেক্ষায়
      (ওপরে ব্যাখ্যা করা হয়েছে)
- [x] Progress visual — percentage bar-এর বদলে honest discrete signal
      (`WorkflowProgressCard`)

**পরবর্তী: Phase 5 — Event Service।** Workflow stage change হলে event
emit করার pattern এখন বসবে (`ARCH_MODEL_APPROVED` ইত্যাদি) — যদিও
বাস্তবে এখনো emit করার মতো কোনো real trigger নেই যতক্ষণ না Architecture
App যুক্ত হয়, তাই এই phase-ও infrastructure-heavy হবে, ঠিক Phase 2-এর
মতো।
