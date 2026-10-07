# AquaPulse — Geospatial Water Quality & Health Surveillance Dashboard

> A responsive React dashboard providing simulated drinking water telemetry and diarrheal outbreak surveillance across 12 monitoring stations in Uttarakhand.

**Live Demo:** [https://aqua-pulse-alpha.vercel.app](https://aqua-pulse-alpha.vercel.app)  
**Problem Statement Reference:** SIH25001 (Smart Community Health Monitoring & Early Warning System)

---

## Key Features

- **Interactive Telemetry Map:** Built with Leaflet to track stations across Garhwal and Kumaon districts with contextual tooltips and zoom framing.
- **Synchronized Time-Series Analytics:** Recharts area curves plotting 7-day acute cases alongside WHO/IS 10500 standards for pH, Turbidity, and Coliform count.
- **Geocoding & Nearest-Station Fallback:** Search any town via OpenStreetMap Nominatim. If an unmonitored town or out-of-state location is searched, Haversine routing identifies and displays the closest telemetry outpost with distance measurements.
- **Field Accessibility Mode:** Introduces redundant geometric glyphs (`▲` Critical, `◆` Warning, `●` Safe) to aid readability under outdoor sunlight and for users with color vision deficiencies.
- **Field Dispatch Printable Export:** Functional print action with explicit demonstration watermarks for local response teams.

---

## Tech Stack

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Mapping:** Leaflet & React-Leaflet
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Geocoding:** OpenStreetMap Nominatim API

---

## Data Methodology

All telemetry data in this project is **synthetically modeled** using standard potable water thresholds:
- **Turbidity:** Permissible limit $< 5.0$ NTU (elevated levels simulate monsoon runoff).
- **pH Level:** Safe standard between $6.5$ and $8.5$.
- **Coliform Bacteria:** Treated drinking standard is $0$ CFU/100mL ($>0$ indicates contamination).

---

## What I Would Improve Next

1. Integrate WebSockets for live telemetry sensor streaming.
2. Add client-side PDF export with custom GIS snapshot rendering.
3. Cache Nominatim geocoding lookups in IndexedDB to minimize external API requests.