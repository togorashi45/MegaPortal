# KPI Dashboard Portal Demo (Next.js)

This project is a functional, sample-data demo of the KPI dashboard defined in `PRD-KPI-Dashboard.docx`.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Custom CSS design system (brand-focused palette)

## Included Modules
- Dashboard (Daily Performance Snapshot)
- Revenue
- Leads
- Meta Ads
- Content & Community
- Expenses & Profitability
- Referrals & Affiliates
- Conversions
- Settings (API connection demo)

## Functional Features
- Module navigation with polished responsive UI
- Global date range filtering (Today, Yesterday, This/Last Week, This/Last Month)
- Role switcher (Admin/Editor/Viewer) that controls editability
- Weekly constraint + checklist editing with local persistence
- Campaign status/notes editing in Meta module
- API connection test simulation in Settings
- Export CSV for every module view
- Auto-refresh timestamp updates every 5 minutes while tab is active

## Run Locally
1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open:

[http://localhost:3000](http://localhost:3000)

## Notes
- Data is seeded mock data only.
- No live APIs are integrated yet.
- This build is meant for UX/flow validation before backend/API wiring.
