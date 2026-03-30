import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Cpu, MemoryStick, Zap, AlertTriangle, Monitor, Battery, CheckCircle, ArrowDown } from 'lucide-react';
import './index.css';
import LandingPage from './LandingPage';

// --- Type Definitions ---
interface MetricsData {
  cpu: { total: number; per_core: number[]; frequency: number; max_frequency: number; };
  memory: { total: number; used: number; available: number; percent: number; };
  gpu: { available: boolean; usage: number; memory_used: number; memory_total: number; };
  battery: { available: boolean; percent: number; plugged: boolean; time_left: number | null; };
  disk: { total: number; used: number; free: number; percent: number; };
  top_processes: Array<{ name: string; cpu: number; memory: number; category: string; }>;
  power: number;
  carbon_per_hour: number;
  power_breakdown: any;
  optimized_power: number;
  optimized_carbon_per_hour: number;
  total_power_savings: number;
  suggestions: Array<{ type: string; icon: string; title: string; description: string; action: string; power_savings: number; carbon_savings: number; processes: any[]; }>;
}

// --- Animated Counter Component ---
const AnimatedNumber = ({ value, suffix = "", fractionDigits = 1 }: { value: number; suffix?: string; fractionDigits?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 800; // ms
    const initialValue = displayValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easePercent = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
      const current = initialValue + (value - initialValue) * easePercent;
      
      setDisplayValue(current);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className="mono">
      {displayValue.toFixed(fractionDigits)}{suffix}
    </span>
  );
};

// --- Dashboard Application ---
function Dashboard() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Data hook
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/metrics");
        if (!response.ok) throw new Error("Network response was not ok");
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError("Unable to connect to Eco-Dashboard API. Ensure backend is running.");
      }
    };

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-full w-full" style={{ minHeight: '100vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} className="text-neon" style={{ margin: '0 auto 1rem', color: 'var(--crit-color)' }} />
          <h2>Connection Lost</h2>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf size={64} className="text-neon glow-animation" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="container">
      {/* Header */}
      <header className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
          <Leaf className="text-neon" size={32} />
          <h2 style={{ margin: 0 }}>EcoTracker</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-neon)', boxShadow: 'var(--accent-glow)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>System Active</span>
          </div>
        </motion.div>
      </header>

      <div className="grid-dashboard">
        
        {/* HERO SECTION - span 12 */}
        <motion.section 
          className="col-span-12 glass-panel flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
          
          <div style={{ zIndex: 1, textAlign: 'center' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Real-Time Carbon Footprint
            </h3>
            
            <h1 style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} className="text-gradient">
              <AnimatedNumber value={data.carbon_per_hour} fractionDigits={1} />
              <span style={{ fontSize: '0.3em', alignSelf: 'flex-end', paddingBottom: '1.2em', color: 'var(--text-muted)' }}>g CO₂/hr</span>
            </h1>

            <div className="flex justify-center gap-4" style={{ marginTop: '2rem' }}>
              <div className="glass-panel" style={{ padding: '12px 24px', background: 'rgba(5, 11, 9, 0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Zap size={18} />
                  <span>Power Draw: <AnimatedNumber value={data.power} suffix="W" fractionDigits={1} /></span>
                </div>
              </div>
              
              {data.total_power_savings > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-panel" style={{ padding: '12px 24px', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)' }}>
                    <ArrowDown size={18} />
                    <span>Potential Savings: <AnimatedNumber value={data.total_power_savings} suffix="W" fractionDigits={1} /></span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* BENTO BOX METRICS */}
        
        {/* CPU Box */}
        <motion.div 
          className="col-span-4 glass-panel"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} /> CPU Load
            </h3>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              <AnimatedNumber value={data.cpu.total} suffix="%" />
            </span>
          </div>

          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              style={{ height: '100%', background: data.cpu.total > 80 ? 'var(--crit-color)' : data.cpu.total > 50 ? 'var(--warn-color)' : 'var(--accent-neon)' }}
              initial={{ width: 0 }}
              animate={{ width: `${data.cpu.total}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between" style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Freq: {(data.cpu.frequency).toFixed(0)} MHz</span>
            <span>Cores: {data.cpu.per_core.length}</span>
          </div>
        </motion.div>

        {/* Memory Box */}
        <motion.div 
          className="col-span-4 glass-panel"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MemoryStick size={20} /> Memory
            </h3>
            <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              <AnimatedNumber value={data.memory.percent} suffix="%" />
            </span>
          </div>

          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              style={{ height: '100%', background: data.memory.percent > 80 ? 'var(--crit-color)' : data.memory.percent > 60 ? 'var(--warn-color)' : 'var(--accent-neon)' }}
              initial={{ width: 0 }}
              animate={{ width: `${data.memory.percent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between" style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Used: {data.memory.used.toFixed(1)} GB</span>
            <span>Total: {data.memory.total.toFixed(1)} GB</span>
          </div>
        </motion.div>

        {/* Battery / Disk Box */}
        <motion.div 
          className="col-span-4 glass-panel"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {data.battery.available ? (
            <>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Battery size={20} /> Battery
                </h3>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <AnimatedNumber value={data.battery.percent} suffix="%" />
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  style={{ height: '100%', background: data.battery.plugged ? 'var(--accent-neon)' : data.battery.percent < 20 ? 'var(--crit-color)' : '#3b82f6' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.battery.percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between" style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span>Status: {data.battery.plugged ? '⚡ Charging' : '🔋 Discharging'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Monitor size={20} /> GPU Usage
                </h3>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {data.gpu.available ? <AnimatedNumber value={data.gpu.usage} suffix="%" /> : 'N/A'}
                </span>
              </div>
               <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  style={{ height: '100%', background: 'var(--accent-neon)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.gpu.available ? data.gpu.usage : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between" style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                 <span>Disk Free: {data.disk.free.toFixed(1)} GB</span>
              </div>
            </>
          )}
        </motion.div>

        {/* TOP PROCESSES */}
        <motion.div 
          className="col-span-12 glass-panel"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        >
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Top Resource Consumers</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.top_processes.map((proc, idx) => (
              <motion.div 
                key={`${proc.name}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                style={{ 
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px',
                  alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ fontWeight: '500' }}>{proc.name}</div>
                <div className="flex items-center gap-2 text-muted">
                  <Cpu size={14} /> <span className="mono">{proc.cpu.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <MemoryStick size={14} /> <span className="mono">{proc.memory.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-neon)', padding: '4px 8px', borderRadius: '20px', textAlign: 'center' }}>
                  {proc.category}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI SUGGESTIONS */}
        <motion.div className="col-span-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Intelligent Optimizations</h2>
          
          <div className="grid-dashboard">
            <AnimatePresence>
              {data.suggestions.length > 0 ? (
                data.suggestions.map((suggestion, idx) => {
                  let bgColor = 'var(--bg-glass)';
                  let borderColor = 'var(--border-glass)';
                  let iconColor = 'var(--accent-neon)';
                  
                  if (suggestion.type === 'high') {
                    bgColor = 'var(--crit-glass)';
                    borderColor = 'var(--crit-color)';
                    iconColor = 'var(--crit-color)';
                  } else if (suggestion.type === 'medium') {
                    bgColor = 'var(--warn-glass)';
                    borderColor = 'var(--warn-color)';
                    iconColor = 'var(--warn-color)';
                  }

                  return (
                    <motion.div 
                      key={idx}
                      className="col-span-6 glass-panel flex flex-col justify-between"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      layout
                      style={{ background: bgColor, borderLeft: `4px solid ${borderColor}` }}
                    >
                      <div>
                        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{suggestion.icon}</span>
                          <h3 style={{ margin: 0 }}>{suggestion.title}</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontWeight: '500', color: iconColor, marginBottom: '8px' }}>Action Required:</div>
                        <div style={{ color: 'var(--text-primary)' }}>{suggestion.action}</div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <motion.div 
                  className="col-span-12 glass-panel flex flex-col items-center justify-center p-8"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={48} className="text-neon" style={{ marginBottom: '1rem' }} />
                  <h2>System Optimized</h2>
                  <p style={{ color: 'var(--text-muted)' }}>We couldn't find any major power inefficiencies.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </main>
  );
}

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <LandingPage onEnter={() => setView('dashboard')} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
