# Hub — Ecosystem Status Card (Phase 1)

## কী যোগ হলো

`app/dashboard/projects/[id]/integration/page.tsx`-এ একটা নতুন card বসানো
হয়েছে — **🌐 Ecosystem App Status**। এটা আগের মতো শুধু ধরে নেয় না যে
data sync হয়েছে; বরং সরাসরি shared Firestore থেকে Structural App-এর
`projects/{id}/structuralData/civp` ডকুমেন্ট আছে কিনা চেক করে real-time
status দেখায়, আর সঠিক production URL দিয়ে "খুলুন" বাটন দেয়
(`https://enginex-structural.vercel.app/project/{id}`)।

বাকি ৪টা App (Architectural, Estimating, Project Management, Reports)
এখনো সেই shared-Firestore মডেলে আনা হয়নি, তাই card-এ ওগুলোর জন্য "এখনো
শুধু manual JSON export" দেখানো হচ্ছে — মিথ্যা "✓ sync হয়েছে" দেখানোর
চেয়ে honest থাকা ভালো।

## নতুন ফাইল

- `components/integration/EcosystemAppsCard.tsx`

## পরিবর্তিত ফাইল

- `app/dashboard/projects/[id]/integration/page.tsx` — নতুন card বসানো +
  নিচের নীল note-টা ঠিক করা হয়েছে (আগে লেখা ছিল "ভবিষ্যতে শেয়ার করবে",
  এখন Structural-এর জন্য এটা already সত্যি)।

## পরবর্তী ধাপে (Phase 2+) এই card-এই বাকি App-গুলো যোগ হবে

`EcosystemAppsCard.tsx`-এর `APPS` array-তে প্রতিটা entry-র `checkPath`
এখন `null` (Architectural/Estimating/PM/Reports-এর জন্য)। যখন সেই App-টা
shared Firestore মডেলে আনা হবে, শুধু সেই entry-র `checkPath`-এ আসল path
বসিয়ে দিলেই card স্বয়ংক্রিয়ভাবে সেটার real status দেখানো শুরু করবে —
আর কোনো কোড পরিবর্তন লাগবে না।
