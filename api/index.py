import psutil
import platform
import time
import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import deque
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import Response
import uvicorn
import asyncio

class PrivateNetworkAccessMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        origin = request.headers.get("origin", "*")
        
        if request.method == "OPTIONS" and "access-control-request-private-network" in request.headers:
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Private-Network"] = "true"
            response.headers["Vary"] = "Origin"
            return response
            
        response = await call_next(request)
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        # Force strict exact origin for PNA compliance
        if origin != "*":
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
        return response

app = FastAPI(title="Eco-Dashboard API")

app.add_middleware(PrivateNetworkAccessMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# History file path
HISTORY_FILE = Path("performance_history.json")

# Known system processes that are typically necessary
SYSTEM_PROCESSES = {
    'Windows': ['System', 'svchost.exe', 'dwm.exe', 'explorer.exe', 'csrss.exe', 'winlogon.exe', 'services.exe', 'lsass.exe'],
    'Darwin': ['kernel_task', 'WindowServer', 'launchd', 'systemd', 'loginwindow', 'Finder'],
    'Linux': ['systemd', 'init', 'Xorg', 'pulseaudio', 'dbus-daemon', 'NetworkManager']
}

# Known resource-heavy applications
HEAVY_APPS = {
    'browsers': ['chrome', 'firefox', 'edge', 'safari', 'opera', 'brave'],
    'media': ['spotify', 'vlc', 'itunes', 'musicbee', 'foobar'],
    'development': ['code', 'pycharm', 'intellij', 'eclipse', 'visual studio'],
    'communication': ['teams', 'slack', 'discord', 'zoom', 'skype'],
    'creative': ['photoshop', 'illustrator', 'premiere', 'blender', 'unity']
}

class CarbonCalculator:
    def __init__(self):
        # Average power consumption estimates (Watts)
        self.IDLE_POWER = 15  # Base system power
        self.CPU_MAX_POWER = 65  # Typical laptop CPU TDP
        self.GPU_MAX_POWER = 75  # Typical laptop GPU TDP
        self.RAM_POWER_PER_GB = 3  # Watts per GB
        self.SCREEN_POWER = 12  # Display power (fixed estimate)
        
        # Carbon intensity (grams CO2 per kWh) - US average
        self.CARBON_INTENSITY = 475  # g CO2/kWh
        
    def calculate_power_consumption(self, cpu_percent, gpu_percent, ram_gb):
        """Calculate estimated power consumption in Watts"""
        cpu_power = (cpu_percent / 100) * self.CPU_MAX_POWER
        gpu_power = (gpu_percent / 100) * self.GPU_MAX_POWER
        ram_power = ram_gb * self.RAM_POWER_PER_GB
        
        total_power = self.IDLE_POWER + cpu_power + gpu_power + ram_power + self.SCREEN_POWER
        return {
            'total': total_power,
            'cpu': cpu_power,
            'gpu': gpu_power,
            'ram': ram_power,
            'screen': self.SCREEN_POWER,
            'idle': self.IDLE_POWER
        }
    
    def calculate_carbon_footprint(self, power_watts, duration_hours=1):
        """Calculate carbon footprint in grams CO2"""
        energy_kwh = (power_watts * duration_hours) / 1000
        carbon_grams = energy_kwh * self.CARBON_INTENSITY
        return carbon_grams
    
    def calculate_yearly_impact(self, power_watts, hours_per_day=8):
        """Calculate yearly carbon impact"""
        daily_kwh = (power_watts * hours_per_day) / 1000
        yearly_kwh = daily_kwh * 365
        yearly_carbon_kg = (yearly_kwh * self.CARBON_INTENSITY) / 1000
        return {
            'kwh': yearly_kwh,
            'carbon_kg': yearly_carbon_kg,
            'trees_equivalent': yearly_carbon_kg / 21  # One tree absorbs ~21kg CO2/year
        }

class SystemMonitor:
    def __init__(self, history_length=120):
        self.history_length = history_length
        self.cpu_history = deque(maxlen=history_length)
        self.memory_history = deque(maxlen=history_length)
        self.power_history = deque(maxlen=history_length)
        self.carbon_history = deque(maxlen=history_length)
        self.timestamps = deque(maxlen=history_length)
        self.process_history = {}  # Track processes over time
        self.process_cpu_times = {}  # Track cpu_times for idle detection
        self.process_idle_since = {}  # Timestamp when process was last detected as idle
        
    def get_cpu_usage(self):
        """Get current CPU usage with per-core breakdown"""
        cpu_percent = psutil.cpu_percent(interval=1)
        per_core = psutil.cpu_percent(interval=0.1, percpu=True)
        freq = psutil.cpu_freq()
        return {
            'total': cpu_percent,
            'per_core': per_core,
            'frequency': freq.current if freq else 0,
            'max_frequency': freq.max if freq else 0
        }
    
    def get_memory_usage(self):
        """Get memory usage statistics"""
        mem = psutil.virtual_memory()
        return {
            'total': mem.total / (1024**3),  # GB
            'used': mem.used / (1024**3),
            'available': mem.available / (1024**3),
            'percent': mem.percent
        }
    
    def get_gpu_usage(self):
        """Attempt to get GPU usage (platform-specific)"""
        gpu_info = {'available': False, 'usage': 0, 'memory': 0}
        
        try:
            if platform.system() == "Windows":
                import subprocess
                result = subprocess.run(
                    ['nvidia-smi', '--query-gpu=utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'],
                    capture_output=True, text=True, timeout=2
                )
                if result.returncode == 0:
                    values = result.stdout.strip().split(',')
                    gpu_info = {
                        'available': True,
                        'usage': float(values[0]),
                        'memory_used': float(values[1]),
                        'memory_total': float(values[2])
                    }
        except Exception:
            pass
        
        return gpu_info
    
    def get_detailed_processes(self):
        """Get detailed process information with resource tracking and idle detection"""
        processes = []
        system_type = platform.system()
        system_procs = SYSTEM_PROCESSES.get(system_type, [])
        now = time.time()
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'num_threads']):
            try:
                info = proc.info
                pid = info.get('pid')
                # Resolve process name with fallbacks
                name = info.get('name')
                if not name or name.strip() == '':
                    try:
                        name = proc.name()
                    except Exception:
                        name = None
                if not name:
                    try:
                        exe = proc.exe()
                        name = Path(exe).name if exe else None
                    except Exception:
                        name = None
                if not name:
                    try:
                        cmd = proc.cmdline()
                        if cmd:
                            name = Path(cmd[0]).name
                    except Exception:
                        name = None
                if not name:
                    name = 'Others'
                
                # Skip system processes
                if any(sys_proc.lower() in name.lower() for sys_proc in system_procs):
                    continue
                
                cpu_val = info.get('cpu_percent') or 0
                mem_val = info.get('memory_percent') or 0
                
                # Only track processes using resources
                if cpu_val > 0.1 or mem_val > 0.5:
                    proc_data = {
                        'pid': pid,
                        'name': name,
                        'cpu': cpu_val,
                        'memory': mem_val,
                        'status': info.get('status', 'unknown'),
                        'threads': info.get('num_threads', 0)
                    }
                    
                    # Categorize process
                    proc_data['category'] = self._categorize_process(name)
                    
                    # ---- CONSERVATIVE IDLE DETECTION ----
                    # Interactive apps (browsers, IDEs, comms) naturally have
                    # idle CPU moments between user actions. We must NOT flag
                    # them as idle just because CPU time didn't change for a
                    # few seconds. Only flag a process as idle if:
                    #   1) Its CPU time hasn't changed for 5+ MINUTES straight
                    #   2) It's NOT a known interactive application
                    #   3) It holds significant memory (>3%)
                    is_idle = False
                    idle_duration = 0
                    
                    # Interactive app categories that should NEVER be flagged
                    # as idle — the user is likely looking at them right now
                    interactive_categories = {'browsers', 'development', 'communication', 'creative'}
                    is_interactive = proc_data['category'] in interactive_categories
                    
                    try:
                        cpu_times = proc.cpu_times()
                        total_cpu_time = cpu_times.user + cpu_times.system
                        proc_key = f"{pid}_{name}"
                        
                        if proc_key in self.process_cpu_times:
                            prev_time, prev_timestamp = self.process_cpu_times[proc_key]
                            time_delta = now - prev_timestamp
                            cpu_time_delta = total_cpu_time - prev_time
                            
                            # Only consider idle if CPU time is truly
                            # unchanged AND the process eats >3% memory
                            # AND it is NOT an interactive app
                            if (time_delta > 2
                                    and cpu_time_delta < 0.01
                                    and mem_val > 3.0
                                    and not is_interactive):
                                if proc_key not in self.process_idle_since:
                                    self.process_idle_since[proc_key] = now
                                idle_duration = now - self.process_idle_since[proc_key]
                                # Only report as idle after 5 full minutes
                                if idle_duration >= 300:
                                    is_idle = True
                                else:
                                    is_idle = False
                            else:
                                # Process is active, reset idle timer
                                self.process_idle_since.pop(proc_key, None)
                        
                        self.process_cpu_times[proc_key] = (total_cpu_time, now)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                    
                    proc_data['is_idle'] = is_idle
                    proc_data['idle_duration'] = round(idle_duration) if is_idle else 0
                    
                    # Track historical usage (sparkline data)
                    if name in self.process_history:
                        hist = self.process_history[name]
                        hist['cpu_samples'].append(cpu_val)
                        hist['mem_samples'].append(mem_val)
                        # Keep last 30 samples for sparkline
                        if len(hist['cpu_samples']) > 30:
                            hist['cpu_samples'].pop(0)
                            hist['mem_samples'].pop(0)
                        proc_data['avg_cpu'] = sum(hist['cpu_samples']) / len(hist['cpu_samples'])
                        proc_data['avg_mem'] = sum(hist['mem_samples']) / len(hist['mem_samples'])
                        proc_data['cpu_sparkline'] = list(hist['cpu_samples'])
                        proc_data['mem_sparkline'] = list(hist['mem_samples'])
                    else:
                        self.process_history[name] = {
                            'cpu_samples': [cpu_val],
                            'mem_samples': [mem_val]
                        }
                        proc_data['avg_cpu'] = cpu_val
                        proc_data['avg_mem'] = mem_val
                        proc_data['cpu_sparkline'] = [cpu_val]
                        proc_data['mem_sparkline'] = [mem_val]
                    
                    processes.append(proc_data)
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        return processes
    
    def _categorize_process(self, name):
        """Categorize process by type"""
        name_lower = name.lower()
        for category, apps in HEAVY_APPS.items():
            if any(app in name_lower for app in apps):
                return category
        return 'other'
    
    def get_top_processes(self, n=5):
        """Get top N processes by resource usage"""
        processes = self.get_detailed_processes()
        processes.sort(key=lambda x: (x['cpu'] or 0) + (x['memory'] or 0), reverse=True)
        return processes[:n]
    
    def get_disk_usage(self):
        """Get disk usage statistics"""
        disk = psutil.disk_usage('/')
        return {
            'total': disk.total / (1024**3),
            'used': disk.used / (1024**3),
            'free': disk.free / (1024**3),
            'percent': disk.percent
        }
    
    def get_battery_info(self):
        """Get battery information if available"""
        try:
            battery = psutil.sensors_battery()
            if battery:
                return {
                    'available': True,
                    'percent': battery.percent,
                    'plugged': battery.power_plugged,
                    'time_left': battery.secsleft if battery.secsleft != psutil.POWER_TIME_UNLIMITED else None
                }
        except Exception:
            pass
        return {'available': False}
    
    def update_history(self, cpu, memory, power, carbon):
        """Update historical data"""
        self.cpu_history.append(cpu)
        self.memory_history.append(memory)
        self.power_history.append(power)
        self.carbon_history.append(carbon)
        self.timestamps.append(datetime.now())

class OptimizationAnalyzer:
    def __init__(self):
        self.baseline_power = 100
        
    def analyze_system(self, cpu_data, memory_data, processes, gpu_data, battery_data, current_power):
        """Analyze system and generate metrics-derived optimization suggestions.
        
        Only produces suggestions when there is a genuine, measurable issue.
        Never guesses whether a user is 'actively using' an application —
        instead relies on the conservative idle detection from SystemMonitor
        which requires 5+ minutes of zero CPU activity on non-interactive apps.
        """
        suggestions = []
        total_power_savings = 0
        
        # --- Only use processes that were genuinely flagged idle by the
        #     conservative cpu-time-delta detector (5 min threshold) ---
        verified_idle_procs = [p for p in processes
                               if p.get('is_idle', False) and p['idle_duration'] >= 300]
        
        # High CPU — factual, not speculative
        high_cpu_procs = [p for p in processes if p['cpu'] > 25]
        
        # Background process noise (many tiny procs)
        background_procs = [p for p in processes
                            if p['cpu'] < 1 and p['memory'] < 1
                            and p.get('category') == 'other']
        
        # 1. HIGH CPU USAGE — only when genuinely extreme (>25%)
        if high_cpu_procs:
            proc_names = [p['name'] for p in high_cpu_procs[:3]]
            proc_details = [(p['name'], p['cpu'], p['category']) for p in high_cpu_procs[:3]]
            
            power_savings = len(high_cpu_procs) * 8
            total_power_savings += power_savings
            
            total_cpu = sum(p['cpu'] for p in high_cpu_procs)
            description = f"Your CPU usage is elevated at **{cpu_data['total']:.1f}%** overall. "
            description += f"The processes contributing most are: **{', '.join(proc_names)}** (combined {total_cpu:.1f}% CPU). "
            description += f"High sustained CPU usage draws approximately **{power_savings}W** of additional power. "
            description += f"If any of these are not needed right now, closing them would reduce power draw and heat generation."
            
            suggestions.append({
                'type': 'high',
                'icon': '⚡',
                'title': 'High CPU Usage Detected',
                'description': description,
                'processes': proc_details,
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Check if any of the listed processes can be closed'
            })
        
        # 2. VERIFIED IDLE PROCESSES — only those with 5+ min of zero activity
        #    on non-interactive apps. No guessing.
        if verified_idle_procs:
            proc_names = [p['name'] for p in verified_idle_procs[:3]]
            proc_details = [(p['name'], p['memory'], p['category']) for p in verified_idle_procs[:3]]
            
            power_savings = len(verified_idle_procs) * 3
            total_power_savings += power_savings
            
            total_mem = sum(p['memory'] for p in verified_idle_procs)
            idle_mins = [f"{p['name']} ({p['idle_duration'] // 60}m)" for p in verified_idle_procs[:3]]
            description = f"**{len(verified_idle_procs)}** non-interactive process(es) have had zero CPU activity for over 5 minutes while holding **{total_mem:.1f}%** of memory: {', '.join(idle_mins)}. "
            description += f"Since these haven't performed any work in minutes, they are likely safe to close. "
            description += f"Closing them could free up memory and save approximately **{power_savings}W**."
            
            suggestions.append({
                'type': 'medium',
                'icon': '💤',
                'title': 'Verified Idle Processes Detected',
                'description': description,
                'processes': proc_details,
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Consider closing the listed idle processes'
            })
        
        # 3. MEMORY PRESSURE — report the fact, don't blame specific apps
        if memory_data['percent'] > 85:
            power_savings = 5
            total_power_savings += power_savings
            
            description = f"Your system memory is at **{memory_data['percent']:.0f}%** ({memory_data['used']:.1f}GB of {memory_data['total']:.1f}GB). "
            description += f"When memory pressure is this high, the system uses swap which increases disk I/O and power consumption by approximately **{power_savings}W**. "
            description += f"Consider closing any applications or browser tabs you're not actively working with to free up memory."
            
            suggestions.append({
                'type': 'high',
                'icon': '💾',
                'title': 'High Memory Pressure',
                'description': description,
                'processes': [],
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Free up memory by closing unused tabs or applications'
            })
        
        # 4. BACKGROUND PROCESS ACCUMULATION — higher threshold
        if len(background_procs) > 15:
            power_savings = 4
            total_power_savings += power_savings
            
            description = f"Your system has **{len(background_procs)}** small background processes running. "
            description += f"While each is individually lightweight, together they contribute to baseline power draw. "
            description += f"You may want to review startup programs and disable auto-updaters or sync services you don't need running constantly."
            
            suggestions.append({
                'type': 'medium',
                'icon': '🔄',
                'title': 'Many Background Processes',
                'description': description,
                'processes': [(p['name'], p['cpu'], 'background') for p in background_procs[:5]],
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Review startup programs and background services'
            })
        
        # 5. GPU ANALYSIS
        if gpu_data.get('available'):
            gpu_usage = gpu_data['usage']
            if gpu_usage > 70:
                power_savings = 25
                total_power_savings += power_savings
                
                description = f"Your GPU is running at **{gpu_usage:.0f}% utilization**, which is very high and consumes substantial power. "
                description += f"GPUs are among the most power-hungry components in your system, often drawing 30-75W under load. "
                description += f"If you're not actively gaming, video editing, or running graphics-intensive applications, this suggests unnecessary GPU usage. "
                description += f"Check for applications using hardware acceleration (browsers, video players) or background rendering tasks. "
                description += f"Closing GPU-intensive applications or disabling hardware acceleration could save up to **{power_savings}W** of power. "
                description += f"This single change could reduce your carbon footprint by {power_savings * 0.475:.1f}g CO₂ per hour."
                
                suggestions.append({
                    'type': 'high',
                    'icon': '🎮',
                    'title': 'Critical: High GPU Usage',
                    'description': description,
                    'processes': [],
                    'power_savings': power_savings,
                    'carbon_savings': power_savings * 0.475,
                    'action': 'Close graphics-intensive applications or disable hardware acceleration'
                })
            elif gpu_usage > 40:
                power_savings = 12
                total_power_savings += power_savings
                
                description = f"Your GPU is moderately active at **{gpu_usage:.0f}% utilization**. "
                description += f"This level of usage is typical for hardware-accelerated web browsers, video playback, or light graphics work. "
                description += f"If you're just browsing or working with documents, consider disabling hardware acceleration in your browser settings. "
                description += f"This simple adjustment could save approximately **{power_savings}W** without noticeably impacting performance for most tasks."
                
                suggestions.append({
                    'type': 'medium',
                    'icon': '🎮',
                    'title': 'Moderate GPU Usage',
                    'description': description,
                    'processes': [],
                    'power_savings': power_savings,
                    'carbon_savings': power_savings * 0.475,
                    'action': 'Consider disabling hardware acceleration if not needed'
                })
        
        # 6. BATTERY-SPECIFIC OPTIMIZATIONS
        if battery_data.get('available') and not battery_data.get('plugged'):
            battery_percent = battery_data['percent']
            
            if battery_percent < 20:
                power_savings = 18
                total_power_savings += power_savings
                
                description = f"Your battery is critically low at **{battery_percent}%** and you're not plugged in. "
                description += f"At this level, every watt counts to keep your system running. "
                description += f"Immediately enable battery saver mode, close all non-essential applications, reduce screen brightness, and disable background sync services. "
                description += f"These emergency measures could save up to **{power_savings}W** and potentially extend your battery life by 30-40 minutes. "
                description += f"Consider plugging in as soon as possible to avoid unexpected shutdown and potential data loss."
                
                suggestions.append({
                    'type': 'high',
                    'icon': '🔋',
                    'title': 'Critical: Low Battery Warning',
                    'description': description,
                    'processes': [],
                    'power_savings': power_savings,
                    'carbon_savings': power_savings * 0.475,
                    'action': 'Enable battery saver and close non-essential apps immediately'
                })
            elif battery_percent < 50:
                power_savings = 10
                total_power_savings += power_savings
                
                description = f"Running on battery power at **{battery_percent}%**. "
                description += f"To maximize your remaining battery life, consider enabling power-saving mode, reducing screen brightness, and closing power-hungry applications. "
                description += f"These adjustments could save approximately **{power_savings}W** and extend your battery by 20-30 minutes."
                
                suggestions.append({
                    'type': 'medium',
                    'icon': '🔋',
                    'title': 'Battery Optimization Recommended',
                    'description': description,
                    'processes': [],
                    'power_savings': power_savings,
                    'carbon_savings': power_savings * 0.475,
                    'action': 'Enable power-saving mode and reduce brightness'
                })
        
        # No filler suggestions — if nothing is wrong, return empty list.
        # The frontend handles the "all clear" state gracefully.
        
        return suggestions, total_power_savings


# Global instances tracking continuous state
monitor = SystemMonitor()
analyzer = OptimizationAnalyzer()
carbon_calc = CarbonCalculator()

@app.get("/api/metrics")
def get_metrics():
    cpu_data = monitor.get_cpu_usage()
    memory_data = monitor.get_memory_usage()
    gpu_data = monitor.get_gpu_usage()
    battery_data = monitor.get_battery_info()
    processes = monitor.get_detailed_processes()
    disk_data = monitor.get_disk_usage()
    
    gpu_usage = gpu_data.get('usage', 0) if gpu_data.get('available') else 0
    power_breakdown = carbon_calc.calculate_power_consumption(
        cpu_data['total'],
        gpu_usage,
        memory_data['used']
    )
    
    current_power = power_breakdown['total']
    current_carbon_per_hour = carbon_calc.calculate_carbon_footprint(current_power, 1)
    
    monitor.update_history(
        cpu_data['total'],
        memory_data['percent'],
        current_power,
        current_carbon_per_hour
    )
    
    suggestions, total_power_savings = analyzer.analyze_system(
        cpu_data, memory_data, processes, gpu_data, battery_data, current_power
    )
    
    optimized_power = max(15, current_power - total_power_savings)
    optimized_carbon_per_hour = carbon_calc.calculate_carbon_footprint(optimized_power, 1)
    current_yearly = carbon_calc.calculate_yearly_impact(current_power, 8)
    optimized_yearly = carbon_calc.calculate_yearly_impact(optimized_power, 8)
    
    # Enrich top processes with memory in MB for display
    top_5 = sorted(processes, key=lambda x: x['cpu'] + (x['memory'] or 0), reverse=True)[:5]
    for p in top_5:
        p['memory_mb'] = round((p['memory'] / 100) * memory_data['total'] * 1024, 1)  # MB
    
    # Count idle processes for summary
    idle_processes = [p for p in processes if p.get('is_idle', False)]
    idle_memory_pct = sum(p['memory'] for p in idle_processes)
    
    return {
        "cpu": cpu_data,
        "memory": memory_data,
        "gpu": gpu_data,
        "battery": battery_data,
        "disk": disk_data,
        "top_processes": top_5,
        "power": current_power,
        "carbon_per_hour": current_carbon_per_hour,
        "power_breakdown": power_breakdown,
        "optimized_power": optimized_power,
        "optimized_carbon_per_hour": optimized_carbon_per_hour,
        "total_power_savings": total_power_savings,
        "suggestions": suggestions,
        "current_yearly": current_yearly,
        "optimized_yearly": optimized_yearly,
        "idle_summary": {
            "count": len(idle_processes),
            "total_memory_percent": round(idle_memory_pct, 1),
            "names": [p['name'] for p in idle_processes[:5]]
        },
        "history": {
            "cpu": list(monitor.cpu_history),
            "memory": list(monitor.memory_history),
            "power": list(monitor.power_history),
            "carbon": list(monitor.carbon_history)
        }
    }

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)