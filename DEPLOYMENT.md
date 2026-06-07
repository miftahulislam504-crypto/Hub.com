# CivilOS Hub — Deployment Guide

## ✅ সম্পূর্ণ Phase Overview

| Phase | বিষয় | অবস্থা |
|-------|-------|--------|
| 1 | Foundation (Auth + Login) | ✅ |
| 2 | Project Registry (CRUD) | ✅ |
| 3 | Site Information | ✅ |
| 4 | BNBC Settings Engine | ✅ |
| 5 | Building Information | ✅ |
| 6 | Dashboard (Charts + Stats) | ✅ |
| 7 | Documents Center | ✅ |
| 8 | Activity Log | ✅ |
| 9 | Integration Bridge | ✅ |
| 10 | Polish & Deploy | ✅ |

---

## 🚀 Deploy করার ধাপ

### Step 1 — Firebase Console Setup

**Authentication:**
```
Build → Authentication → Sign-in method
→ Email/Password → Enable → Save
```

**Firestore:**
```
Build → Firestore Database → Create database
→ Production mode → asia-south1 → Enable
→ Rules → firestore.rules.txt এর content paste করুন → Publish
```

**Storage:**
```
Build → Storage → Get started → Production mode → Done
→ Rules → storage.rules.txt এর content paste করুন → Publish
```

**Web App Config:**
```
Project Settings (⚙️) → General → Your apps
→ </> Web → Register → Config copy করুন
```

---

### Step 2 — Vercel Environment Variables

Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY            = your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        = your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID         = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     = your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID             = your_app_id
```

---

### Step 3 — GitHub → Vercel Connect

```
vercel.com → New Project → Import from GitHub
→ civilos-hub → Deploy
```

---

### Step 4 — PWA Icons (ঐচ্ছিক)

`public/icons/` ফোল্ডারে রাখুন:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

---

## 📁 সম্পূর্ণ ফাইল Structure

```
civilos-hub/
├── app/
│   ├── layout.tsx                    Phase 10 ✅
│   ├── page.tsx                      Phase 1
│   ├── error.tsx                     Phase 10 ✅
│   ├── not-found.tsx                 Phase 10 ✅
│   ├── globals.css                   Phase 1
│   ├── login/page.tsx                Phase 1
│   └── dashboard/
│       ├── layout.tsx                Phase 1 + 8
│       ├── loading.tsx               Phase 10 ✅
│       ├── page.tsx                  Phase 6
│       ├── activity/page.tsx         Phase 8
│       └── projects/
│           ├── page.tsx              Phase 2
│           ├── new/page.tsx          Phase 2
│           └── [id]/
│               ├── page.tsx          Phase 2-8
│               ├── edit/page.tsx     Phase 2
│               └── integration/
│                   └── page.tsx      Phase 9
│
├── components/
│   ├── providers/AuthProvider.tsx    Phase 1
│   ├── shared/
│   │   ├── ErrorBoundary.tsx         Phase 10 ✅
│   │   ├── Skeletons.tsx             Phase 10 ✅
│   │   ├── Toast.tsx                 Phase 10 ✅
│   │   ├── EmptyState.tsx            Phase 10 ✅
│   │   └── OfflineIndicator.tsx      Phase 10 ✅
│   ├── dashboard/
│   │   ├── StatCard.tsx              Phase 6
│   │   ├── StatusDonutChart.tsx      Phase 6
│   │   ├── MonthlyBarChart.tsx       Phase 6
│   │   ├── CompletionProgress.tsx    Phase 6
│   │   └── RecentActivity.tsx        Phase 6
│   ├── site-info/                    Phase 3 (5 files)
│   ├── bnbc/                         Phase 4 (6 files)
│   ├── building/                     Phase 5 (4 files)
│   ├── documents/                    Phase 7 (4 files)
│   ├── activity/                     Phase 8 (2 files)
│   └── integration/                  Phase 9 (3 files)
│
├── lib/
│   ├── firebase.ts                   Phase 1
│   ├── types.ts                      Phase 1
│   ├── utils.ts                      Phase 1
│   ├── firestore.ts                  Phase 2
│   ├── types/
│   │   ├── site-info.types.ts        Phase 3
│   │   ├── bnbc.types.ts             Phase 4
│   │   ├── building.types.ts         Phase 5
│   │   ├── document.types.ts         Phase 7
│   │   ├── activity.types.ts         Phase 8
│   │   └── integration.types.ts      Phase 9
│   ├── firestore/
│   │   ├── site-info.firestore.ts    Phase 3
│   │   ├── bnbc.firestore.ts         Phase 4
│   │   ├── building.firestore.ts     Phase 5
│   │   ├── document.firestore.ts     Phase 7
│   │   └── activity.firestore.ts     Phase 8
│   ├── data/
│   │   └── bangladesh-locations.ts   Phase 3
│   └── services/
│       └── integration.service.ts    Phase 9
│
├── store/
│   ├── useAuthStore.ts               Phase 1
│   ├── useProjectStore.ts            Phase 2
│   ├── useSiteInfoStore.ts           Phase 3
│   ├── useBNBCStore.ts               Phase 4
│   ├── useBuildingStore.ts           Phase 5
│   ├── useDocumentStore.ts           Phase 7
│   └── useActivityStore.ts           Phase 8
│
├── public/
│   └── manifest.json                 Phase 10 ✅
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                        Phase 10 ✅
├── firestore.rules.txt                Phase 10 ✅
└── storage.rules.txt                  Phase 7
```

---

## 🎯 Integration Map (Final)

```
CivilOS Hub (Master Data Store)
    │
    ├──→ Architectural Drawing App
    │       Site Info + Building Info নেবে
    │
    ├──→ Structural Analysis & Design App
    │       BNBC + Building Info + Site Info নেবে
    │
    ├──→ Estimating, Costing & BOQ App
    │       Building Info + BNBC Live Load নেবে
    │
    ├──→ Project Management & Tracking App
    │       Project Registry + সব Data নেবে
    │
    └──→ Reports App
            সব App এর Data একসাথে নেবে
```

---

## 🔮 Future Roadmap

- Dark mode toggle
- Bengali calendar integration
- Push notifications (FCM)
- Direct API integration (Hub → Other Apps automatically)
- Multi-user / team collaboration
- PDF report generation from Hub
- Mobile app (React Native / Expo)
