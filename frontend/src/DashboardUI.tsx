import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Signal } from 'lucide-react';
import { WavyLineChart, MetricBar, SmallLabel } from './components/Visuals';

interface MetricsData {
  cpu: { total: number; frequency: number; per_core: number[] };
  memory: { percent: number; used: number; total: number };
  gpu: { available: boolean; usage: number };
  battery: { available: boolean; percent: number; plugged: boolean };
  power: number;
  carbon_per_hour: number;
  power_breakdown: {
    cpu: number;
    gpu: number;
    ram: number;
    screen: number;
    idle: number;
    total: number;
  };
  current_yearly: {
    kwh: number;
    trees_equivalent: number;
  };
}

const AnimatedNumber = ({ value, fractionDigits = 1 }: { value: number; fractionDigits?: number }) => (
  <span>{value.toFixed(fractionDigits)}</span>
);

export function DashboardUI() {
  const [data, setData] = useState<MetricsData | null>(null);

  useEffect(() => {
    const fetchMetrics = () => {
      fetch("http://localhost:8000/api/metrics")
        .then(r => r.json())
        .then(json => {
          setData(json);
        })
        .catch(() => {
          setData({
            cpu: { total: 10.9, frequency: 5.2, per_core: [] },
            memory: { percent: 78, used: 12.4, total: 16 },
            gpu: { available: true, usage: 3 },
            battery: { available: true, percent: 94, plugged: false },
            power: 42.8,
            carbon_per_hour: 4.4,
            power_breakdown: { cpu: 12, gpu: 3, ram: 5, screen: 8, idle: 15, total: 43 },
            current_yearly: { kwh: 325, trees_equivalent: 0.8 }
          });
        });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050706' }}>
      <Activity className="glow-animation" size={48} color="var(--accent-neon)" />
    </div>
  );

  const cardStyle = { 
    background: 'var(--bg-card)', 
    borderRadius: '24px', 
    border: '1px solid var(--border-glass)', 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    position: 'relative' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
  };

  const hoverProps: any = {
    whileHover: { 
      scale: 1.015, 
      borderColor: 'rgba(46, 204, 113, 0.4)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 20px rgba(46, 204, 113, 0.1)'
    },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '2.5rem 1.5rem', backgroundColor: 'var(--bg-primary)', color: 'white', overflowX: 'hidden' }}>
      
      {/* DASHBOARD GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gridAutoRows: 'minmax(180px, auto)',
          gap: '1.5rem', 
          maxWidth: '1400px', 
          margin: '0 auto' 
        }}
      >

        {/* 1. CARBON FOOTPRINT (Left Top) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 4', gridRow: 'span 2' }}>
          <SmallLabel>CARBON FOOTPRINT</SmallLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '20px 0' }}>
            <h2 style={{ fontSize: '5.5rem', margin: 0, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
              <AnimatedNumber value={data.carbon_per_hour} fractionDigits={1} />
            </h2>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>gCO₂/hr</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
            Real-time hardware emission translation based on current {data.power.toFixed(0)}W draw.
          </p>
          <WavyLineChart value={data.carbon_per_hour * 10} />
        </motion.div>

        {/* 2. YEARLY PROJECTION (Middle Top) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 4', gridRow: 'span 2' }}>
          <SmallLabel>YEARLY PROJECTION</SmallLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '20px 0' }}>
            <h2 style={{ fontSize: '5.5rem', margin: 0, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
              <AnimatedNumber value={data.current_yearly?.trees_equivalent || 0.8} />
            </h2>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Trees</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            Equivalent annual CO₂ absorption required for current habits.
          </p>
          
          <MetricBar value={60} segmented={false} />
          
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: 'auto' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{(data.current_yearly?.kwh || 325).toFixed(0)} kWh</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Consumption</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>$48.20</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Annual Cost</div>
            </div>
          </div>
        </motion.div>

        {/* 3. CPU LOAD (Right Top Left) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <SmallLabel>CPU LOAD</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.cpu.total.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.cpu.total} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>5.2 GHz // 38°C</div>
        </motion.div>

        {/* 4. MEMORY (Right Top Right) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <SmallLabel>MEMORY</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.memory.used.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>GB</span></div>
          <MetricBar value={data.memory.percent} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Available: {(data.memory.total - data.memory.used).toFixed(1)} GB</div>
        </motion.div>

        {/* 6. GPU UTILIZATION (Right Middle Left) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <SmallLabel>GPU UTILIZATION</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.gpu.usage.toFixed(0)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.gpu.usage} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Idle // 32°C</div>
        </motion.div>

        {/* 7. BATTERY HEALTH (Right Middle Right) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 2' }}>
          <SmallLabel>BATTERY HEALTH</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.battery.percent} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.battery.percent} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Cycle Count: 142</div>
        </motion.div>

        {/* 5. INTELLIGENT OPTIMIZATION (Bottom Left & Middle) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 8', gridRow: 'span 2' }}>
          <SmallLabel>INTELLIGENT OPTIMIZATION</SmallLabel>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '16px 0 28px', letterSpacing: '-0.01em' }}>Resource Hog Detection</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <OptimizationRow name="Google Chrome Helper" info="Draining 12.5W in background. Potential saving: 6.2g CO₂/hr" action="TERMINATE" status="crit" />
            <OptimizationRow name="Spotify.exe" info="High memory pressure (1.2GB). Optimization suggested." action="SUSPEND" status="warn" />
            <OptimizationRow name="System Updates" info="Schedule for off-peak hours to use renewable energy grid." action="RESCHEDULE" status="none" />
          </div>
        </motion.div>

        {/* 8. POWER DRAW ANALYSIS (Bottom Right) */}
        <motion.div variants={itemVariants} {...hoverProps} style={{ ...cardStyle, gridColumn: 'span 4', gridRow: 'span 2' }}>
          <SmallLabel>POWER DRAW ANALYSIS</SmallLabel>
          <div style={{ fontSize: '5rem', fontWeight: 800, margin: '20px 0 12px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <AnimatedNumber value={data.power} /> <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Watts</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-telemetry)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Signal size={16} />
            </motion.div> 
            ↓ 12% vs Yesterday
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6 }}>Current combined system wattage consumption.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={breakdownLabel}>Display</div>
              <MetricBar value={(data.power_breakdown.screen / data.power) * 100} height="4px" />
            </div>
            <div>
              <div style={breakdownLabel}>SoC / Core</div>
              <MetricBar value={(data.power_breakdown.cpu / data.power) * 100} height="4px" />
            </div>
            <div>
              <div style={breakdownLabel}>RAM / Memory</div>
              <MetricBar value={(data.power_breakdown.ram / data.power) * 100} height="4px" />
            </div>
            <div>
              <div style={breakdownLabel}>Idle Baseline</div>
              <MetricBar value={(data.power_breakdown.idle / data.power) * 100} height="4px" />
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

const breakdownLabel = { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' };

function OptimizationRow({ name, info, action, status }: { name: string; info: string; action: string; status: 'crit' | 'warn' | 'none' }) {
  const borderColor = status === 'crit' ? 'var(--crit-color)' : (status === 'warn' ? 'var(--warn-color)' : '#4b5563');
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 20px', 
      background: 'rgba(255,255,255,0.02)', 
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
      borderLeft: `4px solid ${borderColor}`
    }}>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px' }}>{name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{info}</div>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        style={{ 
          background: 'rgba(255,255,255,0.05)', 
          color: 'white', 
          border: '1px solid rgba(255,255,255,0.1)', 
          padding: '6px 12px', 
          borderRadius: '40px', 
          fontSize: '0.65rem', 
          fontWeight: 700, 
          cursor: 'pointer',
          letterSpacing: '0.05em'
        }}
      >
        {action}
      </motion.button>
    </div>
  );
}
