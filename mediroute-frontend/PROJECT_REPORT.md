# MediRoute — Project Report & Feature Overview

> **Smart Emergency Hospital Matching Network**  
> *Competition-Level Clinical Decision Support & Capability-Aware Emergency Routing Platform*

---

## 1. Executive Summary

**MediRoute** is an intelligent emergency healthcare coordination platform designed to route critical patients to hospitals based on **real-time capability eligibility** (ICU beds, ventilators, Cath Labs, emergency blood reserves) rather than just geographic distance. It addresses the dangerous flaw in standard navigation maps, which direct emergency patients to the nearest hospital even if that hospital lacks an open ICU bed, ventilator, or required specialist.

---

## 2. Key Features & Capabilities

### 🩺 1. Intelligent Emergency Triage Search
* **Clinical Presets (ACLS & ATLS Verified)**:
  * **Cardiac Emergency**: Auto-selects 24/7 ED, Cardiology Cath Lab, ICU, Oxygen, Ventilator, and Blood Bank standby.
  * **Trauma Emergency**: Auto-selects Trauma Surgical Suite (OR), Blood Bank reserves, ICU, Ventilator, and Oxygen.
  * **Respiratory Emergency (SARI Protocol)**: Auto-selects ED, Ventilator, High-flow Oxygen, and ICU.
  * **General Emergency**: Recommends Emergency Department triage.
* **Capability Verification**: Manual override toggle for 8 critical medical capabilities (*ICU*, *Ventilator*, *Oxygen*, *Emergency Dept*, *Surgery*, *Blood*, *Cardiology*, *Neurology*).

### 🩸 2. Emergency Patient Blood Group Triage & NWU Directory
* **Patient Blood Group Selector**: Triage selection for 8 blood groups (`O-`, `O+`, `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`).
* **North Western University (NWU) Blood Bank Integration**: Live matching directory of **109 verified student blood donors** from NWU, Khulna (CSE, EEE, CIVIL departments) with direct contact details.

### 🏥 3. Khulna Healthcare Hub & Specialist Doctor Directory
* **431 Khulna Doctors Directory**: Searchable directory categorized by specialty (*Cardiology*, *Neurology*, *General Surgery*, *Pediatric*, *Gynecology*, *Orthopedic*, etc.).
* **Khulna Hospital Network**: Real-time status for major medical centers in Khulna (e.g., *Khulna Medical College Hospital*, *CityCare Trauma & Emergency Hospital*, *Mercy General Hospital*, *Sunrise Specialty Center*).

### 🤖 4. MediRoute AI Assistant
* Custom clinical decision-support AI bot trained to assist emergency seekers in identifying recommended capabilities and nearest specialized care options.

### 🗺️ 5. Interactive Map & Proximity Visualization
* Embedded **Leaflet + OpenStreetMap** map with custom color-coded hospital markers, real-time distance calculations (km), and travel time estimates.

### ⚖️ 6. Transparent Explainable Recommendation Engine
* **Capability-First Ranking**: Hospitals missing a required capability are strictly filtered out before ranking by distance.
* **Multi-Factor Scoring**: Transparent breakdown showing *Capability Fit (55%)*, *Proximity (35%)*, *Signal Freshness (20%)*, and *Verification Status (5%)*.

### 👥 7. Multi-Role Demo Workspaces
* **Emergency Seeker / Patient Advocate**: Triage search, blood group matching, decision support dashboard.
* **Hospital Admin**: Real-time control panel to update available ICU beds, ventilators, oxygen status, and ED open/closed state.
* **System Admin**: Network operations dashboard monitoring verifications, active EDs, resource signals, and audit logs.

---

## 3. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript + Vite |
| **Styling & Icons** | Tailwind CSS + Lucide React Icons |
| **Mapping Engine** | Leaflet.js + OpenStreetMap Tiles |
| **Routing & State** | React Router v6 + Local State Management |
| **Launcher Tools** | 1-Click Batch (`run.bat`) & PowerShell (`run.ps1`) Launchers |

---

## 4. Summary Statement

MediRoute bridges the gap between emergency seekers and hospital resource reality. By combining **clinical protocol guidelines**, **real-time resource signals**, **Khulna regional medical directories**, and **NWU blood bank donor matching**, it empowers emergency seekers and first responders to make lifesaving decisions when every minute counts.
