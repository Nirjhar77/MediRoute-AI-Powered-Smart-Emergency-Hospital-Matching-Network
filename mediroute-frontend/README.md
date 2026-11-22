# MediRoute — Smart Emergency Hospital Matching Network

Competition-quality **frontend-only React prototype** based on the MediRoute project report.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Lucide React
- Leaflet + OpenStreetMap tiles
- Deterministic local mock data
- Local state + localStorage for the live-update demonstration

## Quick 1-Click Run Options

### Option 1: 1-Click Unified Launcher (Windows)
Double-click `run.bat` (or right-click `run.ps1` and select *Run with PowerShell*). It automatically launches all 3 tiers:
1. **PostgreSQL 16 Server** (Port `5432`)
2. **FastAPI Backend API** (Port `8000` with Swagger Docs at `/docs`)
3. **React + Vite Frontend** (Port `5173`, automatically opens in your browser with mobile Wi-Fi QR access)

### Option 2: Individual Services
- **Full Stack Launcher**: `d:\mediroute-frontend\run.bat`
- **Frontend Only**: `cd mediroute-frontend && npm run dev`
- **Backend Only**: `cd mediroute-backend && run_backend.bat`
- **Database Only**: `cd pgsql && start_postgres.bat`

## Demo flow

1. Login → **Caregiver**
2. Select emergency type + required capabilities
3. Confirm demo location
4. Review the interactive hospital map and eligibility explanations
5. Open **Best Match** for explainable ranking
6. View hospital details
7. For the live-update demo, log out and enter **Hospital Admin**, change ICU/ventilator/oxygen/ED status, save, then return to the caregiver recommendation. The same local mock state updates the recommendation.
8. **System Admin** provides network monitoring, verification, resource monitoring, users, and audit history.

## Architecture

```text
src/
├── components/   Reusable UI, layout, hospital cards, Leaflet map
├── data/         Deterministic demo hospitals and recent searches
├── hooks/        Local demo state and persistence
├── layouts/      Reserved for future page layouts
├── pages/        Caregiver, discovery, recommendation, admin screens
├── services/     Eligibility and ranking logic, isolated from UI
├── types/        Shared TypeScript domain types
├── routes/       Reserved for future route extraction
├── App.tsx
└── main.tsx
```

The `services/matching.ts` boundary is intentionally kept separate so the same UI can later consume FastAPI responses without rebuilding the interface.

> MediRoute is a **decision-support system**, not a diagnosis, treatment, or guaranteed-admission system. Demo hospitals and availability data are fictional.
