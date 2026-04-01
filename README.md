# 🌿 Eco-Tracker: Real-Time Carbon Footprint Monitor

Eco-Tracker is a hardware telemetry dashboard that monitors your laptop's resource usage in real-time and calculates the resulting carbon footprint. It identifies idle processes, shows power consumption breakdowns, and provides metrics-derived suggestions to help reduce your environmental impact — without any AI guesswork.

---

## ✨ Key Features

### 📊 Real-Time System Telemetry
- **Hardware Monitoring:** Live tracking of CPU load (per-core), memory pressure, GPU utilization, battery health, and disk usage.
- **2-second polling:** Dashboard refreshes every 2 seconds via the `/api/metrics` endpoint.

### 🌍 Carbon Footprint Calculation
- **Power Draw Model:** Estimates system wattage from CPU%, GPU%, RAM, screen, and idle baseline using hardware power coefficients.
- **CO₂ Conversion:** Translates watts to grams of CO₂ per hour using a configurable carbon intensity factor (default: India grid average, 0.82 kg CO₂/kWh).
- **Yearly Projection:** Extrapolates current usage to annual kWh, kg CO₂, and tree-offset equivalents.

### 🔍 Conservative Idle Process Detection
- **CPU Time Delta Tracking:** Uses `proc.cpu_times()` to detect if a process's CPU time has genuinely stopped changing — not just low CPU percentage.
- **5-Minute Threshold:** A process is only flagged idle after 5+ continuous minutes of zero CPU activity.
- **Interactive App Exemption:** Browsers, IDEs, communication apps, and creative tools are *never* flagged as idle — these naturally have gaps between user interactions without being truly idle.
- **Memory Threshold:** Only processes using >3% of system memory are considered for idle flagging.

### 📋 Process Table (Top 5)
- **Resource Ranking:** Shows the top 5 processes sorted by combined CPU + memory usage.
- **Category Badges:** Automatic categorization (Browser, Media, Dev, Communication, Creative, System, Other).
- **Sparkline Trends:** Inline SVG charts showing last 30 samples of CPU and memory history per process.
- **Idle Badges:** Golden "💤 Xm idle" badge only appears for genuinely verified idle processes.

### 💡 Metrics-Derived Insights
Suggestions are generated from **measured data only** — no AI, no guessing:
- **High CPU Alert:** Triggered only when a single process uses >25% CPU.
- **Verified Idle Processes:** Only shown when processes have had zero CPU delta for 5+ minutes (non-interactive apps only).
- **Memory Pressure:** Triggered at >85% RAM — never blames specific apps.
- **Background Noise:** Flags when >15 tiny background processes accumulate.
- **GPU Alert:** Triggered at >40% GPU utilization.
- **Battery Warnings:** Context-aware suggestions when unplugged at <50% or <20%.
- **No Filler:** If nothing is wrong, the panel shows "System Healthy" — no forced suggestions.

### ⚡ Carbon Optimization Comparison
- **Before/After Gauge:** Animated SVG arc showing current vs. optimized power draw.
- **Savings Breakdown:** Shows potential watt and CO₂ savings if suggestions are followed.
- **Yearly Impact:** kWh/year saved and trees-equivalent visualization.

---

## 🎨 Design

"Tech-Noir" aesthetic:
- **Background:** `#050807` (deepest mint-black)
- **Accent:** `#2ecc71` (neon emerald)
- **Cards:** Glassmorphic panels with `rgba(13, 18, 16, 0.7)` backdrop
- **Typography:** Space Grotesk (headings), JetBrains Mono (metrics/data)
- **Animations:** Framer Motion spring-based transitions, staggered grid entrance

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.13) |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Vanilla CSS (Design system tokens) |
| Animation | Framer Motion |
| System Data | psutil (CPU, RAM, Disk, Battery, Processes) |
| Icons | Lucide React |
| Routing | React Router v6 |

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd Eco_Tracker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
# API runs at http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# UI runs at http://localhost:5173
```

Visit `http://localhost:5173` — the landing page explains the project; click **Dashboard** to see live telemetry.

---

## 📁 Project Structure

```
Eco_Tracker/
├── app.py                          # FastAPI backend: telemetry, carbon calc, optimization
├── requirements.txt                # Python deps (fastapi, psutil, uvicorn, etc.)
├── CONTEXT_HANDOVER.md             # Project context for development continuity
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Router + global layout (Navbar, Footer)
│   │   ├── DashboardUI.tsx         # Main telemetry grid (12-col bento layout)
│   │   ├── LandingPage.tsx         # Hero + features section
│   │   ├── index.css               # Design system tokens + responsive grid
│   │   └── components/
│   │       ├── Navigation.tsx      # Glassmorphic navbar + footer
│   │       ├── Visuals.tsx         # MetricBar, WavyLineChart, SmallLabel
│   │       ├── ProcessTable.tsx    # Live top-5 process table with sparklines
│   │       ├── InsightsPanel.tsx   # Expandable suggestion cards
│   │       └── CarbonComparison.tsx # Before/after arc gauge
│   ├── package.json
│   └── vite.config.ts
└── performance_history.json        # Local historical data (auto-generated)
```

---

## ⚠️ Notes

- **macOS Recommended:** psutil has best coverage on macOS. GPU monitoring uses Apple Silicon integrated metrics (no discrete GPU driver needed).
- **No Process Killing:** Eco-Tracker never terminates or suspends processes. It only provides information and suggestions.
- **No AI:** All suggestions are derived from measurable system metrics. Nothing is predicted, hallucinated, or assumed.
- **Privacy:** All data stays local. No telemetry is sent to any external server.
