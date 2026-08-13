# Skillpath — Creator-Led Learning Platform

> Complete solution for the Junior Developer Role Assignment: A responsive, high-performance landing page and custom Framer Code Component featuring live API integration, graceful error handling for flaky endpoints, dynamic currency math, and developer testing tools.

---

## 🌟 Key Highlights & Implementation Summary

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Hero Section** | Headline, one line under it, "Explore Courses" button with smooth scroll | ✅ Done |
| **Courses Section (API)** | Live `GET /assignment/course-data` (5–10 items, dynamic array length) | ✅ Done |
| **Currency Switching** | Live `GET /assignment/country-code` (`IN` = `pricePaise / 100` -> ₹1,999; `US` = `priceUsdCents / 100` -> $39.99) | ✅ Done |
| **Flaky API Resilience** | Decoupled fallback on 404/500: country failure never crashes courses; 4 distinct UI states (Loading, Error, Empty, Working) | ✅ Done |
| **Card Schema** | Course Name, Clean 2-Line Clamped Description, Formatted Price, `mainCategory`, `courseType`, and `refundable` badge | ✅ Done |
| **Framer Code Component** | Ready-to-copy single-file component with `addPropertyControls` (Title, Subtitle, Currency Fallback, Accent Color, Search) | ✅ Done |
| **Responsiveness** | 3 columns on Desktop, 2 columns on Tablet, 1 column on Mobile | ✅ Done |
| **Bonus Features** | Live search filtering, Sort dropdown (Price / Name), Category filter pills, Skeleton shimmer loaders, Retry button | ✅ Done |
| **Developer Tools** | Interactive API Simulator & Framer Code Copier Modal built into the live preview | ✅ Done |

---

## 📁 Repository Structure

```
.
├── framer/
│   └── SkillpathCourses.framer.tsx   # Single-file Framer Code Component (Ready to copy into Framer)
├── src/
│   ├── components/
│   │   ├── ApiSandboxModal.tsx       # Live API flakiness & edge-case inspector
│   │   ├── Footer.tsx                # 3 links + copyright line
│   │   ├── FramerCodeModal.tsx       # Code viewer with 1-click clipboard copy
│   │   ├── Hero.tsx                  # Hero headline, subhead & CTA
│   │   ├── Navbar.tsx                # Header with Framer & Dev Tools triggers
│   │   └── SkillpathCourses.tsx      # Main courses component with live API logic
│   ├── types/
│   │   └── course.ts                 # TypeScript interfaces for API & props
│   ├── utils/
│   │   └── formatters.ts             # Price conversion math & localization
│   ├── App.tsx                       # Root application layout
│   └── index.css                     # Design tokens & responsive styling
├── SUBMISSION_NOTE.md                # Candidate submission note (< 200 words)
├── AI_DISCLOSURE_AND_EXPLAINER.md    # Line-by-line code explanation for live interview
├── FRAMER_SETUP_GUIDE.md             # Step-by-step instructions for Framer publishing
└── package.json                      # Project dependencies & build scripts
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🧮 Currency Math Safeguards

- **Indian Rupees (`IN`)**: `199900` paise $\div 100 = \text{₹}1,999$
- **US Dollars (`US`)**: `3999` cents $\div 100 = \$39.99$
- Uses `Intl.NumberFormat('en-IN')` and `Intl.NumberFormat('en-US')` for localized thousand-grouping and symbol formatting.

---

## 📝 Candidate Submission Artifacts

1. **Submission Note**: Read [`SUBMISSION_NOTE.md`](./SUBMISSION_NOTE.md) (covers what would be fixed with 2 more days, where stuck, and what was challenging).
2. **AI Disclosure & Interview Guide**: Read [`AI_DISCLOSURE_AND_EXPLAINER.md`](./AI_DISCLOSURE_AND_EXPLAINER.md) (line-by-line guide to ace the 20-minute live modification challenge).
3. **Framer Component File**: Open [`framer/SkillpathCourses.framer.tsx`](./framer/SkillpathCourses.framer.tsx).
# webveda.assign
