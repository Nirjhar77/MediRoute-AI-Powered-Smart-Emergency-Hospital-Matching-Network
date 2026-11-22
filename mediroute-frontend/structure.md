# MediRoute — Full-Stack Project Structure & File Guide

> **Smart Emergency Hospital Matching Network**  
> *Concise architectural overview and file-by-file reference for both Backend and Frontend systems.*

---

## 📌 Project Overview

**MediRoute** is an intelligent emergency healthcare routing platform designed for **Khulna, Bangladesh**. Unlike generic navigation tools that only calculate geographic distance, MediRoute matches emergency patients with medical facilities based on **real-time clinical capability eligibility** (ICU beds, ventilators, surgical teams, oxygen reserves, and blood availability).

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Leaflet Maps
- **Backend**: Python FastAPI + SQLAlchemy ORM + Pydantic v2 + SQLite / PostgreSQL 16
- **Local Database**: Embedded PostgreSQL 16 (`pgsql/`) with automatic SQLite fallback (`mediroute.db`)

---

## 📂 Complete Directory Tree

```text
mediroute/
├── run.bat                         # 1-Click launcher (DB + Backend + Frontend)
├── run.ps1                         # PowerShell 1-Click launcher
├── start_full_stack.bat            # Full-stack service starter
├── run_backend.bat                 # Backend-only launcher
├── structure.md                    # Project structure & file guide (this file)
│
├── pgsql/                          # Embedded PostgreSQL 16 database server
│   └── data/                       # PostgreSQL cluster storage directory
│
├── mediroute-backend/              # Python FastAPI Backend
│   ├── .env                        # Backend environment configuration
│   ├── requirements.txt            # Python dependencies (FastAPI, SQLAlchemy, etc.)
│   ├── run_backend.bat             # Backend launch & venv setup script
│   ├── mediroute.db                # SQLite database (zero-setup fallback)
│   └── app/                        # Application source code
│       ├── main.py                 # FastAPI app, API routers & CORS setup
│       ├── config.py               # Settings, environment variables, server config
│       ├── database.py             # SQLAlchemy engine, session maker & DB lifecycle
│       ├── models.py               # SQLAlchemy ORM models (Hospital, Doctor, Donor)
│       ├── schemas.py              # Pydantic validation schemas & API contracts
│       ├── matching.py             # Server-side clinical matching & scoring algorithm
│       └── seed_data.py            # Khulna dataset seeder (Hospitals, Doctors, Donors)
│
└── mediroute-frontend/             # React + Vite Frontend
    ├── index.html                  # HTML5 entry document
    ├── package.json                # Dependencies, build scripts & metadata
    ├── vite.config.ts              # Vite bundler & HMR configuration
    ├── tailwind.config.js          # Design system & medical theme color palette
    ├── postcss.config.js           # PostCSS Tailwind CSS processor
    ├── tsconfig.json               # TypeScript compiler configuration
    ├── PROJECT_REPORT.md           # Clinical protocols & system report
    ├── structure.md                # Frontend documentation copy
    └── src/                        # Frontend source code
        ├── main.tsx                # React root mounting point
        ├── App.tsx                 # Route declarations & role-based guard
        ├── index.css               # Global stylesheet, animations & Leaflet styles
        ├── types/
        │   └── index.ts            # TypeScript interfaces & types
        ├── hooks/
        │   └── useDemo.ts          # State hook for demo roles, hospitals & triage
        ├── services/
        │   └── matching.ts         # Client-side triage matching algorithm
        ├── data/
        │   ├── mockData.ts         # Khulna hospitals & clinical triage presets
        │   ├── doctorsData.ts      # 431 Khulna specialist doctors directory
        │   └── northwesternBloodDonors.ts # 109 NWU student blood donors
        ├── components/
        │   ├── Layout.tsx          # App shell, top navigation bar & active role badge
        │   ├── UI.tsx              # Reusable UI primitives (buttons, modals, badges)
        │   ├── Map.tsx             # Interactive Leaflet map with color-coded markers
        │   ├── HospitalCard.tsx    # Hospital match score card with triage indicators
        │   ├── HospitalDrawer.tsx  # Slide-out drawer with full hospital facility profile
        │   ├── HospitalCompareModal.tsx # Side-by-side hospital comparison dialog
        │   ├── SearchSequenceModal.tsx  # Visual step-by-step matching pipeline modal
        │   ├── GeminiAssistantModal.tsx # AI clinical triage assistance chatbot
        │   └── NetworkStatus.tsx   # Live network updates & verification ticker
        └── pages/
            ├── Login.tsx           # Role selector (Caregiver, Hospital Admin, System Admin)
            ├── Dashboard.tsx       # Caregiver landing page with emergency triage presets
            ├── Caregiver.tsx       # Interactive protocol & required capability selector
            ├── Discovery.tsx       # OpenStreetMap search with distance radius slider
            ├── Recommendation.tsx  # Ranked hospital matches with "Why Not Nearest" bypass
            ├── HospitalDetails.tsx # Detailed hospital capacity & contact directory
            ├── KhulnaHub.tsx       # Khulna emergency hotlines & healthcare summary
            ├── Doctors.tsx         # Directory of 431 Khulna specialist doctors
            ├── NorthwesternBloodBank.tsx # NWU student blood donor registry & search
            ├── HospitalAdmin.tsx   # Hospital bed/ventilator/oxygen management panel
            └── SystemAdmin.tsx     # Network-wide monitoring & audit log dashboard
```

---

## 📄 File-by-File Reference (What Each File Does)

### 1. Root & Orchestration Scripts

| File | Purpose |
| :--- | :--- |
| `run.bat` | **1-Click Windows Launcher**: Automatically initializes PostgreSQL, launches the FastAPI backend in a background window, starts the Vite React frontend, and opens the browser. |
| `run.ps1` | **PowerShell Launcher**: PowerShell alternative to `run.bat` for launching PostgreSQL, backend, and frontend with color-coded status checks. |
| `start_full_stack.bat` | **Quick Stack Starter**: Lightweight script to run both backend and frontend concurrently. |
| `run_backend.bat` | **Backend-Only Starter**: Activates the Python virtual environment and starts Uvicorn at `http://localhost:8000`. |
| `structure.md` | **Documentation**: Concise architectural and file breakdown of the entire repository. |

---

### 2. Backend Files (`mediroute-backend/`)

| File | Purpose |
| :--- | :--- |
| `mediroute-backend/app/main.py` | **FastAPI Entry Point**: Configures FastAPI app, CORS middleware, API routes (`/api/hospitals`, `/api/match`, `/api/doctors`, `/api/donors`, `/api/admin/update-resource`), and auto-generated Swagger documentation at `/docs`. |
| `mediroute-backend/app/config.py` | **Environment & Config**: Defines server settings, host, port, database connection string, and CORS whitelist. |
| `mediroute-backend/app/database.py` | **Database Lifecycle**: Initializes SQLAlchemy engine and session factory; automatically falls back to SQLite (`mediroute.db`) if PostgreSQL is unavailable. |
| `mediroute-backend/app/models.py` | **ORM Database Models**: SQLAlchemy entity classes defining database tables: `HospitalModel`, `DoctorModel`, `DonorModel`, and `EmergencyRequestModel`. |
| `mediroute-backend/app/schemas.py` | **Validation Schemas**: Pydantic models for incoming API payloads and outbound JSON responses (data serialization & validation). |
| `mediroute-backend/app/matching.py` | **Server Matching Engine**: Python implementation of the multi-factor scoring algorithm (Capability 50%, Availability 25%, Proximity 25%) and "Why Not Nearest" clinical bypass rationale generator. |
| `mediroute-backend/app/seed_data.py` | **Database Seeder**: Populates the database with Khulna hospitals, **431 Khulna specialist doctors**, and **109 North Western University student blood donors**. |
| `mediroute-backend/requirements.txt` | **Python Dependencies**: Specifies required packages (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `psycopg2-binary`). |
| `mediroute-backend/.env` | **Environment Config**: Stores database URLs and operational flags. |
| `mediroute-backend/mediroute.db` | **SQLite Database**: Standalone local database file enabling zero-dependency operation. |

---

### 3. Frontend Core & Configuration (`mediroute-frontend/`)

| File | Purpose |
| :--- | :--- |
| `mediroute-frontend/index.html` | **HTML Document**: Web app container loading the `<div id="root">` element and web fonts. |
| `mediroute-frontend/package.json` | **NPM Manifest**: Manages project dependencies (`react`, `react-router-dom`, `leaflet`, `lucide-react`, `tailwindcss`) and scripts (`npm run dev`, `build`). |
| `mediroute-frontend/vite.config.ts` | **Vite Config**: Configures Vite dev server, React Fast Refresh plugin, and port settings. |
| `mediroute-frontend/tailwind.config.js` | **Tailwind Config**: Defines custom medical color palette (emergency red, clinical blue, success emerald), typography, and animations. |
| `mediroute-frontend/postcss.config.js` | **PostCSS Config**: Chains Tailwind CSS and Autoprefixer for cross-browser CSS compilation. |
| `mediroute-frontend/tsconfig.json` | **TypeScript Config**: Sets strict typing rules and React JSX transformation settings. |

---

### 4. Frontend Application Layer (`src/`)

| File | Purpose |
| :--- | :--- |
| `src/main.tsx` | **React Bootstrap**: Mounts `<App />` into the DOM inside `React.StrictMode` and `BrowserRouter`. |
| `src/App.tsx` | **Router & Auth Guard**: Maps all 11 client routes and enforces role-based access control via `<Guard>`. |
| `src/index.css` | **Global Styles**: Contains Tailwind utility directives, custom glassmorphism styles, scrollbars, and Leaflet map overrides. |
| `src/types/index.ts` | **TypeScript Definitions**: Central data contracts for `Hospital`, `Doctor`, `Donor`, `EmergencyRequest`, `Capability`, and `UserRole`. |
| `src/hooks/useDemo.ts` | **Global State Hook**: Custom React hook managing active user role, live hospital capacity state, and active emergency triage tickets. |
| `src/services/matching.ts` | **Client Matching Engine**: Computes hospital match scores and generates clinical bypass justifications directly on the client. |

---

### 5. Frontend Data Stores (`src/data/`)

| File | Purpose |
| :--- | :--- |
| `src/data/mockData.ts` | Khulna hospital datasets (coordinates, ICU, ventilators, oxygen) and clinical triage presets (Cardiac, Trauma, Respiratory, Pediatric). |
| `src/data/doctorsData.ts` | Curated directory of **431 Khulna specialist doctors** with degrees, designations, departments, and hospital affiliations. |
| `src/data/northwesternBloodDonors.ts` | Live directory of **109 North Western University (NWU) student blood donors** indexed by blood group and phone numbers. |

---

### 6. User View Pages (`src/pages/`)

| Page File | Purpose & Functionality |
| :--- | :--- |
| `src/pages/Login.tsx` | **Role Portal**: Allows instant role selection (Caregiver/Seeker, Hospital Admin, System Admin). |
| `src/pages/Dashboard.tsx` | **Emergency Dashboard**: Caregiver dashboard with one-click emergency condition presets and instant hospital suggestions. |
| `src/pages/Caregiver.tsx` | **Triage Protocol Selector**: Interactive triage questionnaire to specify critical needs (ICU, ventilator, surgery, blood). |
| `src/pages/Discovery.tsx` | **Interactive Map Search**: Map-based hospital discovery tool with dynamic radius sliders and capability filter toggles. |
| `src/pages/Recommendation.tsx` | **Match Results**: Displays ranked hospital recommendations with multi-factor score breakdown and clinical bypass explanations. |
| `src/pages/HospitalDetails.tsx` | **Hospital Profile**: Comprehensive facility profile showing current bed availability, contact numbers, and departments. |
| `src/pages/KhulnaHub.tsx` | **Khulna Health Hub**: Regional emergency directory displaying ambulance hotlines, civil surgeon contacts, and district statistics. |
| `src/pages/Doctors.tsx` | **Specialist Directory**: Searchable, filterable list of 431 Khulna doctors organized by clinical specialty. |
| `src/pages/NorthwesternBloodBank.tsx` | **NWU Blood Bank**: Student blood donor finder filtered by blood group (`A+`, `O-`, `B+`, etc.) with direct contact buttons. |
| `src/pages/HospitalAdmin.tsx` | **Hospital Manager Panel**: Live control board for hospital staff to update ICU beds, ventilator count, and diversion status. |
| `src/pages/SystemAdmin.tsx` | **System Operations Dashboard**: High-level network monitor displaying active ED counts, hospital verification states, and audit logs. |

---

### 7. UI Components (`src/components/`)

| Component File | Purpose |
| :--- | :--- |
| `src/components/Layout.tsx` | Application shell with sticky header, navigation links, and active role switcher. |
| `src/components/UI.tsx` | Atomic design system components: `Button`, `Card`, `Badge`, `Modal`, `Select`, `Input`, `ProgressBar`. |
| `src/components/Map.tsx` | Leaflet map integration displaying user position, hospital location pins, and capability status colors. |
| `src/components/HospitalCard.tsx` | Recommendation card showing match score percentage, distance, travel time, and available resources. |
| `src/components/HospitalDrawer.tsx` | Slide-over drawer providing quick facility insights, emergency contact dialing, and route overview. |
| `src/components/HospitalCompareModal.tsx` | Modal comparing 2–3 hospitals side-by-side across beds, surgical readiness, and distance. |
| `src/components/SearchSequenceModal.tsx` | Animated multi-step modal visualizing the live emergency matching and capability verification pipeline. |
| `src/components/GeminiAssistantModal.tsx` | Clinical decision-support chatbot offering preliminary triage guidance and protocol advice. |
| `src/components/NetworkStatus.tsx` | Floating toast component showing live system synchronizations and hospital updates. |
