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
import uvicorn
import asyncio

app = FastAPI(title="Eco-Dashboard API")

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
        """Get detailed process information with resource tracking"""
        processes = []
        system_type = platform.system()
        system_procs = SYSTEM_PROCESSES.get(system_type, [])
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'num_threads']):
            try:
                info = proc.info
                # Resolve process name with fallbacks: info['name'] -> proc.name() -> exe -> cmdline
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
                        'pid': info.get('pid'),
                        'name': name,
                        'cpu': cpu_val,
                        'memory': mem_val,
                        'status': info.get('status', 'unknown'),
                        'threads': info.get('num_threads', 0)
                    }
                    
                    # Categorize process
                    proc_data['category'] = self._categorize_process(name)
                    
                    # Track historical usage
                    if name in self.process_history:
                        hist = self.process_history[name]
                        hist['cpu_samples'].append(cpu_val)
                        hist['mem_samples'].append(mem_val)
                        # Keep last 30 samples
                        if len(hist['cpu_samples']) > 30:
                            hist['cpu_samples'].pop(0)
                            hist['mem_samples'].pop(0)
                        proc_data['avg_cpu'] = sum(hist['cpu_samples']) / len(hist['cpu_samples'])
                        proc_data['avg_mem'] = sum(hist['mem_samples']) / len(hist['mem_samples'])
                    else:
                        self.process_history[name] = {
                            'cpu_samples': [cpu_val],
                            'mem_samples': [mem_val]
                        }
                        proc_data['avg_cpu'] = cpu_val
                        proc_data['avg_mem'] = mem_val
                    
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
        """Analyze system and generate intelligent optimization suggestions"""
        suggestions = []
        total_power_savings = 0
        
        # Analyze individual processes
        high_cpu_procs = [p for p in processes if p['cpu'] > 15]
        moderate_cpu_procs = [p for p in processes if 5 < p['cpu'] <= 15]
        high_mem_procs = [p for p in processes if p['memory'] > 8]
        moderate_mem_procs = [p for p in processes if 3 < p['memory'] <= 8]
        
        # Idle but resource-consuming processes (low CPU but high memory or vice versa)
        idle_heavy_procs = [p for p in processes if p['cpu'] < 2 and p['memory'] > 5]
        
        # Check for unnecessary background processes
        background_procs = [p for p in processes if 0.5 < p['cpu'] < 3 and p['avg_cpu'] < 2]
        
        # 1. HIGH CPU USAGE ANALYSIS
        if high_cpu_procs:
            proc_names = [p['name'] for p in high_cpu_procs[:3]]
            proc_details = [(p['name'], p['cpu'], p['category']) for p in high_cpu_procs[:3]]
            
            power_savings = len(high_cpu_procs) * 8
            total_power_savings += power_savings
            
            # Build detailed paragraph
            if len(high_cpu_procs) == 1:
                proc = high_cpu_procs[0]
                description = f"The application **{proc['name']}** is currently consuming {proc['cpu']:.1f}% of your CPU resources, which is significantly high. "
                if proc['category'] != 'other':
                    description += f"As a {proc['category']} application, it may be performing heavy operations in the background. "
                description += f"Closing this application could immediately reduce your system's power consumption by approximately **{power_savings}W** and significantly improve responsiveness. "
                description += f"If you're not actively using it, consider closing it or checking if there are any stuck processes within the application."
            else:
                total_cpu = sum(p['cpu'] for p in high_cpu_procs)
                description = f"Multiple applications are consuming excessive CPU resources (combined {total_cpu:.1f}%). "
                description += f"The top offenders are: **{', '.join(proc_names)}**. "
                description += f"These {len(high_cpu_procs)} applications are collectively draining significant power from your system. "
                description += f"Closing unnecessary ones could reduce power consumption by up to **{power_savings}W** and free up processing power for tasks that matter. "
                description += f"Review which applications you're actively using and consider closing the rest."
            
            suggestions.append({
                'type': 'high',
                'icon': '⚡',
                'title': 'Critical: High CPU Usage Detected',
                'description': description,
                'processes': proc_details,
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Close or restart the mentioned applications'
            })
        
        # 2. IDLE RESOURCE HOGS
        if idle_heavy_procs:
            proc_names = [p['name'] for p in idle_heavy_procs[:3]]
            proc_details = [(p['name'], p['memory'], p['category']) for p in idle_heavy_procs[:3]]
            
            power_savings = len(idle_heavy_procs) * 3
            total_power_savings += power_savings
            
            total_mem = sum(p['memory'] for p in idle_heavy_procs)
            description = f"Your system has {len(idle_heavy_procs)} application(s) that appear to be idle but are still consuming significant memory ({total_mem:.1f}% total). "
            description += f"Applications like **{', '.join(proc_names[:3])}** are sitting in the background using RAM without doing meaningful work. "
            description += f"When RAM is heavily used, your system works harder and consumes more power. "
            description += f"Closing these idle applications could save approximately **{power_savings}W** and free up {total_mem:.0f}% of your memory. "
            description += f"This will make your system more responsive and energy-efficient, especially if you're running on battery power."
            
            suggestions.append({
                'type': 'medium',
                'icon': '💤',
                'title': 'Idle Applications Consuming Resources',
                'description': description,
                'processes': proc_details,
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Close applications you\'re not actively using'
            })
        
        # 3. MEMORY PRESSURE
        if memory_data['percent'] > 75 and high_mem_procs:
            proc_names = [p['name'] for p in high_mem_procs[:3]]
            proc_details = [(p['name'], p['memory'], p['category']) for p in high_mem_procs[:3]]
            
            power_savings = len(high_mem_procs) * 4
            total_power_savings += power_savings
            
            description = f"Your system is experiencing memory pressure with {memory_data['percent']:.0f}% of RAM currently in use ({memory_data['used']:.1f}GB of {memory_data['total']:.1f}GB). "
            description += f"The main contributors are: **{', '.join(proc_names)}**, which are collectively using a substantial portion of your available memory. "
            description += f"High memory usage forces your system to work harder, increases heat generation, and significantly impacts battery life. "
            description += f"Closing {len(high_mem_procs)} of these memory-intensive applications could save around **{power_savings}W** of power and prevent potential system slowdowns. "
            description += f"If you need these applications, consider closing browser tabs or saving your work and restarting them to clear memory leaks."
            
            suggestions.append({
                'type': 'high',
                'icon': '💾',
                'title': 'Critical: High Memory Pressure',
                'description': description,
                'processes': proc_details,
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Close memory-heavy applications or restart them'
            })
        
        # 4. BACKGROUND PROCESS ACCUMULATION
        if len(background_procs) > 8:
            proc_names = [p['name'] for p in background_procs[:5]]
            
            power_savings = 6
            total_power_savings += power_savings
            
            description = f"Your system is running **{len(background_procs)} background processes** that are quietly consuming resources. "
            description += f"While individually small, together they create unnecessary load on your CPU and memory. "
            description += f"Common culprits include auto-updaters, sync services, and startup programs you may not need running constantly. "
            description += f"Examples include: **{', '.join(proc_names)}**. "
            description += f"Closing or disabling unnecessary background processes could save approximately **{power_savings}W** and improve overall system responsiveness. "
            description += f"Consider reviewing your startup programs and disabling services you don't regularly use."
            
            suggestions.append({
                'type': 'medium',
                'icon': '🔄',
                'title': 'Too Many Background Processes',
                'description': description,
                'processes': [(p['name'], p['cpu'], 'background') for p in background_procs[:5]],
                'power_savings': power_savings,
                'carbon_savings': power_savings * 0.475,
                'action': 'Review and close unnecessary background services'
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
        
        # 7. SYSTEM RUNNING WELL
        if cpu_data['total'] < 25 and memory_data['percent'] < 60 and len(suggestions) < 2:
            description = f"Great news! Your system is running efficiently with CPU at {cpu_data['total']:.1f}% and memory at {memory_data['percent']:.1f}%. "
            description += f"This optimal performance means you're already being energy-conscious. "
            description += f"To maintain this efficiency: keep only necessary applications open, regularly update your software to benefit from performance improvements, "
            description += f"periodically restart applications that tend to accumulate memory over time (especially web browsers), "
            description += f"and consider using dark mode which can reduce screen power consumption on OLED displays. "
            description += f"Your current configuration is saving approximately **5W** compared to a typical heavily-loaded system. Keep up the good work!"
            
            suggestions.append({
                'type': 'low',
                'icon': '✅',
                'title': 'System Running Efficiently',
                'description': description,
                'processes': [],
                'power_savings': 0,
                'carbon_savings': 0,
                'action': 'Maintain current good practices'
            })
        
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
    
    return {
        "cpu": cpu_data,
        "memory": memory_data,
        "gpu": gpu_data,
        "battery": battery_data,
        "disk": disk_data,
        "top_processes": sorted(processes, key=lambda x: x['cpu'] + (x['memory'] or 0), reverse=True)[:5],
        "power": current_power,
        "carbon_per_hour": current_carbon_per_hour,
        "power_breakdown": power_breakdown,
        "optimized_power": optimized_power,
        "optimized_carbon_per_hour": optimized_carbon_per_hour,
        "total_power_savings": total_power_savings,
        "suggestions": suggestions,
        "current_yearly": current_yearly,
        "optimized_yearly": optimized_yearly,
        "history": {
            "cpu": list(monitor.cpu_history),
            "memory": list(monitor.memory_history),
            "power": list(monitor.power_history),
            "carbon": list(monitor.carbon_history)
        }
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)