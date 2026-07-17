# Phase 1 — Data Contract শক্ত করা

## যা করা হলো

### ১. নতুন ফাইল: `lib/types/contract.types.ts`
Ecosystem-wide versioned data contract। তিনটা জিনিস আছে এখানে:

- **`ContractEnvelope<T>`** — যেকোনো module payload-কে wrap করার generic shape
  (`schemaVersion`, `sourceApp`, `projectId`, `moduleVersion`, `generatedAt`, `data`)।
  এখনো active use নেই (HubExportPayload এখনো নিজের flat shape রাখছে,
  backward compatibility-এর জন্য) — কিন্তু ভবিষ্যতের সব module এই envelope
  ব্যবহার করবে।
- **`ProjectLevel`, `ProjectGrid`, `BuildingElementRef`** — মূল প্ল্যানের
  section 7-এ যে উদাহরণ ছিল, হুবহু সেই shape। এখনো কোনো producer/consumer
  নেই (Architectural App এখনো shared model-এ আসেনি), কিন্তু contract-first
  রাখার জন্য এখনই define করা হলো।
- **`ContractStatus`** — Phase 3 (Approval System)-এর জন্য enum shape
  আগে থেকে বসানো (`DRAFT → ... → APPROVED/OUTDATED/REJECTED`)। এখনো কোনো
  logic নেই, শুধু type।

### ২. পরিবর্তিত: `lib/types/integration.types.ts`
`HubExportPayload`-এ নতুন required ফিল্ড: `contractSchemaVersion`।
পুরনো `version: '1.0'` ফিল্ড রয়ে গেছে ভাঙা এড়াতে — `contractSchemaVersion`
হচ্ছে আসল ecosystem-wide schema version, `contract.types.ts`-এর
`CONTRACT_SCHEMA_VERSION` থেকে আসে।

### ৩. পরিবর্তিত: `lib/services/integration.service.ts`
নতুন ফিল্ড populate করা হলো export payload বানানোর সময়।

### ৪. পরিবর্তিত: `components/integration/AppExportCard.tsx`
Per-app filtered payload বানানোর সময়ও নতুন ফিল্ড কপি করা হলো — এই ফাইলটা
আগের round-এ দেখা হয়নি, `tsc` চালিয়ে ধরা পড়েছে।

**Build verified:** `npx tsc --noEmit` চালিয়ে দেখা হয়েছে — এই চার ফাইলের
কারণে কোনো নতুন error নেই।

---

## ✅ সিদ্ধান্ত হয়ে গেছে: `civilos_bridge` collection

`firestore.rules`-এ এই rule আছে:
```
match /civilos_bridge/{bridgeDocId} { allow read, write: if isSignedIn(); }
```
কমেন্টে লেখা ছিল: `Ecosystem bridge: civilos_bridge/{projectId}_{sourceApp}`

**যা নিশ্চিত করা হয়েছিল:** Hub codebase-এ (এই zip-এ) কোথাও এই collection
read বা write হয় না — `grep -rn "civilos_bridge"` পুরো `app/`, `lib/`,
`components/`, `store/` জুড়ে খালি ফলাফল দিয়েছিল।

**নতুন তথ্য:** Structural App এখনো complete না। মানে এখন পর্যন্ত এই
bridge collection-এর ওপর ভিত্তি করে বাস্তবে তেমন কিছু build হয়নি —
migration/sunk cost নেই।

**সিদ্ধান্ত: Deprecate going forward।**
- Rule-টা `firestore.rules` থেকে *delete করা হয়নি* — এটা deployed file,
  Structural App-এর আংশিক কাজ (যদি কিছু থাকে) হঠাৎ ভেঙে যাওয়ার ঝুঁকি
  নেওয়া হয়নি।
- কিন্তু rule-এর ওপরে একটা ⚠️ DEPRECATED comment বসানো হয়েছে, যাতে
  ভবিষ্যতে যখন Structural App নিয়ে আবার কাজ শুরু হবে, নতুন কোনো feature
  এই bridge-এর ওপর ভিত্তি করে না বানানো হয় — বরং `contract.types.ts`-এর
  `ContractEnvelope` ব্যবহার করে Hub-এর মাধ্যমে data exchange করা হয়,
  প্ল্যানের core rule অনুযায়ী: *"Structural App কখনো Architectural App-এর
  private collection directly read করবে না। Hub approved snapshot
  provide করবে।"*

**এই decision-টা reversible** — যদি Structural App-এর কাজ শুরু হওয়ার পর
দেখা যায় bridge collection-টা আসলে দরকারি কোনো কারণে বানানো হয়েছিল,
তখন সেই context দেখে সিদ্ধান্ত বদলানো যাবে। আপাতত এটা শুধু "নতুন কাজ
এখানে না বসানোর" নির্দেশনা, স্থায়ী মুছে ফেলা না।

---

## Phase 1 — সব checklist item বন্ধ হলো

- [x] Shared interfaces (`ProjectLevel`, `ProjectGrid`, `BuildingElementRef`)
- [x] `civilos_bridge` investigation
- [x] Decision নেওয়া (deprecate going forward)
- [x] Contract version-tagged (`contractSchemaVersion`)

**পরবর্তী: Phase 2 — Version Dependency System।**
