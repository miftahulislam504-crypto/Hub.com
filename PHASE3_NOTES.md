# Phase 3 — Approval System

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/approval.types.ts`
`ApprovalActor` (মানুষ বা `SYSTEM_ACTOR`), `ApprovalRecord` (current status),
`ApprovalHistoryEntry` (audit trail entry)। `ContractStatus` এনামটা Phase 1
থেকেই `contract.types.ts`-এ ছিল — এখানে re-export করা হলো যাতে approval-
সম্পর্কিত কোড এক জায়গা থেকে import করতে পারে।

### ২. নতুন ফাইল: `lib/firestore/approval.firestore.ts`
- `projects/{projectId}/approvals/{moduleId}` — বর্তমান status
- `projects/{projectId}/approvals/{moduleId}/history/{historyId}` — audit trail
  (append-only, `hist_${Date.now()}` id, `bnbc.firestore.ts`-এ activity_logs-এ
  যেমন pattern আছে সেভাবেই)
- `downgradeToOutdatedIfApproved()` — শুধু তখনই কাজ করে যখন module আগে থেকে
  সত্যিই `APPROVED` ছিল; `DRAFT`/`REVIEWED` অবস্থায় থাকলে touch করে না,
  invalidate করার মতো কিছু নেই তখন।

**Import direction ঠিক রাখা হয়েছে circular dependency এড়াতে:**
`approval.firestore.ts` কিছুই import করে না `dependency.firestore.ts` থেকে।
`dependency.firestore.ts` import করে `approval.firestore.ts` থেকে
(cascade downgrade আর lock-check-এর জন্য)। একমুখী, তাই কোনো cycle নেই।

### ৩. পরিবর্তিত: `lib/firestore/dependency.firestore.ts`
`bumpModuleVersion()`-এ দুইটা নতুন cascade rule বসানো হলো (দুটোই best-effort,
try/catch-এ wrap করা — fail করলেও version bump নিজে persist থাকে):

1. **নিজের approval নিজেই invalidate**: কোনো module সম্পাদনা করে নতুন version
   হলে, যদি সেটা আগে `APPROVED` ছিল, এখন `OUTDATED` হয়ে যায় — approved content
   আর actual content আর মিলছে না।
2. **Downstream-এর approval cascade invalidate**: এই module-এর ওপর যারা
   নির্ভরশীল (Phase 2-এর dependency edge অনুযায়ী), তাদের dependency-status
   `OUTDATED` হয়ে গেলে (মানে upstream version তাদের link করা version ছাড়িয়ে
   গেছে), এবং তাদের approval আগে `APPROVED` ছিল — সেটাও `OUTDATED`-এ নেমে যায়।

এছাড়া নতুন export: **`isModuleUnlocked(projectId, moduleId)`** — একটা
module-এর সব upstream dependency `APPROVED` কিনা চেক করে, না হলে
`blockedBy` তালিকা ফেরত দেয়। এটা প্ল্যানের "Architectural Model Not
Approved" ধরনের স্টেজ-লক ধারণা বাস্তবায়ন করে।

### ৪. রিফ্যাক্টর: `MODULE_LABELS` centralize
আগে `DependencyStatusCard.tsx`-এ define করা ছিল, এখন `dependency.types.ts`-এ
সরানো হলো, দুইটা component (DependencyStatusCard + নতুন ApprovalCard) একই
জায়গা থেকে import করে।

### ৫. নতুন UI: `components/integration/ApprovalCard.tsx`
Integration page-এ `DependencyStatusCard`-এর পরে বসানো হয়েছে। প্রতিটা
module-এর জন্য: current status badge, কে/কখন করেছিল, ৩টা action বাটন
(রিভিউ সম্পন্ন / অনুমোদন / প্রত্যাখ্যান), expandable ইতিহাস।

**⚠️ ইচ্ছাকৃত সরলীকরণ — খোলাখুলি বলে রাখছি:**
প্ল্যানের status enum পুরোপুরি linear (`DRAFT → PROCESSING →
READY_FOR_REVIEW → REVIEWED → APPROVED`), কিন্তু UI-তে যেকোনো status থেকে
সরাসরি Approve/Reject করা যায়, ধাপে ধাপে যেতে বাধ্য করা হয়নি। কারণ: এই মুহূর্তে
তুমি একাই সব role পালন করছ (architect + reviewer + approver), তাই কড়াকড়ি
state machine এখন শুধু friction যোগ করবে, সুরক্ষা না। যখন সত্যিই একাধিক
মানুষ/App যুক্ত হবে (Phase 4+), তখন এই enforcement সহজেই বসানো যাবে —
enum আর history logic ইতিমধ্যে পুরোপুরি প্রস্তুত।

**⚠️ Lock তথ্যমূলক, hard-block না:**
`isModuleUnlocked()` সত্যিকারের কাজ করে (real Firestore query, real logic),
কিন্তু এখন কোনো form/tab disable করে না — শুধু ApprovalCard-এ একটা amber নোট
দেখায় ("Site Info এখনো Approved হয়নি")। তোমার বর্তমান solo, iterative
workflow-এ হঠাৎ tab lock করে দিলে নিজের কাজেই বাধা হয়ে যেত। ভবিষ্যতে
আসল multi-person workflow এলে এই একই function দিয়ে hard gate বসানো
সহজ — infrastructure প্রস্তুত, decision শুধু পিছিয়ে রাখা হয়েছে।

**Firestore rules:** নতুন কিছু লাগেনি — `{document=**}` wildcard
`approvals/{moduleId}/history/{historyId}`-এর মতো নেস্টেড path-ও cover করে,
যাচাই করে নিশ্চিত হয়েছি।

**Build verified:** `npx tsc --noEmit` — Phase 1/2-এর সময় পাওয়া একই ৩টা
pre-existing, সম্পর্কহীন error ছাড়া নতুন কোনো error নেই।

---

## Phase 3 checklist — সব বন্ধ

- [x] `approvals` collection সক্রিয় (আগে rules-এ ছিল, কোড ব্যবহার করত না —
      এখন সক্রিয়ভাবে read/write হয়)
- [x] Status enum প্রতিটা module-এ (`ContractStatus`, Phase 1 থেকে, এখন
      বাস্তবে ব্যবহৃত)
- [x] Approve/Reject action UI + audit trail (`ApprovalCard.tsx`)
- [x] Stage-lock ধারণা (`isModuleUnlocked` — informational, hard-block না,
      কারণ ওপরে বলা হয়েছে)
- [x] Phase 2-এর version system-এর সাথে যুক্ত (দুই cascade rule
      `bumpModuleVersion`-এ)

**পরবর্তী: Phase 4 — Workflow Engine।** এটা এখন সরাসরি Phase 3-এর
approval status থেকে workflow stage derive করবে (`Project Created →
Architecture Started → ... `)।
