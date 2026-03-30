# 🌿 Eco-Tracker: Cyber-Organic System Intelligence

Eco-Tracker is a high-end, real-time system monitoring SaaS that translates raw hardware telemetry into actionable environmental impact data. Moving beyond standard task managers, it provides a "Cyber-Organic" interface to help users optimize their digital carbon footprint through intelligent resource management.

## ✨ Key Features

### 🚀 Real-time Telemetry
- **Hardware Monitoring:** Live tracking of CPU load, Memory pressure, GPU utilization, and Battery health.
- **Micro-Metric Precision:** Monitor core frequencies, available RAM in GB, and granular battery discharge states.

### 🌍 Environmental Impact Engine
- **Carbon Footprint Calculation:** Real-time translation of power draw into grams of CO₂ emitted per hour (g CO₂/hr).
- **Power Draw Analysis:** Live visibility into system wattage consumption across different hardware components.
- **Yearly Projection:** Estimates of annual energy usage and tree-absorption equivalents based on current habits.

### 🤖 Intelligent Optimization (AI)
- **Automatic Resource Hog Detection:** Identifies "Idle Resource Hogs" and background processes that are draining power without adding value.
- **Actionable Insights:** Dynamic suggestions with specific power-saving estimates (e.g., "Close Chrome to save 8.5W and 4.0g CO₂/hr").
- **Severity Ranking:** Critical, Medium, and Low priority alerts to help you focus on the most impactful optimizations.

### 🎨 Next-Gen "Cyber-Organic" UI
- **Bento Box Architecture:** A visually stunning, glassmorphic grid layout for hardware metrics.
- **Fluid Motion:** Smooth, spring-based animations for all numerical data and entrance transitions.
- **Atmospheric Design:** Deep emerald accents, SVG grain overlays, and organic blur effects for a premium SaaS experience.

---

## 🛠 Tech Stack

- **Backend:** FastAPI (Python 3.13 Ready)
- **Frontend:** React + Vite + TypeScript
- **Styling:** Vanilla CSS (Cyber-Organic Design System)
- **Animation:** Framer Motion
- **Data:** psutil, NumPy, Pandas

---

## 🚀 Getting Started

### 1. Backend Setup (API)
```bash
# Clone the repository
git clone <repository-url>
cd Eco_Tracker

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup (Dashboard)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` to view your dashboard. The API will be running at `http://localhost:8000/api/metrics`.

---

## 📁 Project Structure

- `app.py`: FastAPI server handling hardware telemetry and optimization logic.
- `requirements.txt`: Python backend dependencies.
- `frontend/`: React application directory.
  - `src/App.tsx`: Main dashboard component with Framer Motion logic.
  - `src/index.css`: Cyber-Organic design system and utility classes.
- `performance_history.json`: Local storage for historical performance tracking.

---

## 💡 Note
Eco-Tracker works best on macOS and Windows with local sensor access. GPU monitoring requires NVIDIA hardware (nvidia-smi) on Windows systems.
