import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Signal, HardDrive, AlertCircle } from 'lucide-react';
import { AnimatedActivity } from './components/AnimatedActivity';
import { WavyLineChart, MetricBar, SmallLabel } from './components/Visuals';
import { ProcessTable } from './components/ProcessTable';
import { InsightsPanel } from './components/InsightsPanel';
import { CarbonComparison } from './components/CarbonComparison';

interface MetricsData {
  cpu: { total: number; frequency: number; per_core: number[] };
  memory: { percent: number; used: number; total: number };
  gpu: { available: boolean; usage: number };
  battery: { available: boolean; percent: number; plugged: boolean };
  disk: { total: number; used: number; free: number; percent: number };
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
    carbon_kg: number;
    trees_equivalent: number;
  };
  optimized_power: number;
  optimized_carbon_per_hour: number;
  total_power_savings: number;
  optimized_yearly: {
    kwh: number;
    carbon_kg: number;
    trees_equivalent: number;
  };
  top_processes: {
    pid: number;
    name: string;
    cpu: number;
    memory: number;
    memory_mb: number;
    category: string;
    is_idle: boolean;
    idle_duration: number;
    cpu_sparkline: number[];
    mem_sparkline: number[];
    avg_cpu: number;
    avg_mem: number;
    status: string;
    threads: number;
  }[];
  suggestions: {
    type: 'high' | 'medium' | 'low';
    icon: string;
    title: string;
    description: string;
    processes: [string, number, string][];
    power_savings: number;
    carbon_savings: number;
    action: string;
  }[];
  idle_summary: {
    count: number;
    total_memory_percent: number;
    names: string[];
  };
  history: {
    cpu: number[];
    memory: number[];
    power: number[];
    carbon: number[];
  };
}

const AnimatedNumber = ({ value, fractionDigits = 1 }: { value: number; fractionDigits?: number }) => (
  <span>{value.toFixed(fractionDigits)}</span>
);

const breakdownLabel = { fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' };

export function DashboardUI() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'cloud' | 'local' | 'mock'>('mock');

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchMetrics = async () => {
      if (cancelled) return;

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      try {
        const response = await fetch("/api/metrics");
        if (cancelled) return;

        if (response.ok) {
          const json = await response.json();
          if (!cancelled) {
            setData(json);
            setIsMockData(false);
            setConnectionMode(isLocalhost ? 'local' : 'cloud');
          }
        } else {
          throw new Error('API error');
        }
      } catch (e) {
        if (cancelled) return;
        setIsMockData(true);
        setConnectionMode('mock');
        setData({
          cpu: { total: 10.9, frequency: 5.2, per_core: [8, 12, 6, 15] },
          memory: { percent: 78, used: 12.4, total: 16 },
          gpu: { available: true, usage: 3 },
          battery: { available: true, percent: 94, plugged: false },
          disk: { total: 500, used: 280, free: 220, percent: 56 },
          power: 42.8,
          carbon_per_hour: 4.4,
          power_breakdown: { cpu: 12, gpu: 3, ram: 5, screen: 8, idle: 15, total: 43 },
          current_yearly: { kwh: 325, carbon_kg: 154, trees_equivalent: 7.3 },
          optimized_power: 28.2,
          optimized_carbon_per_hour: 2.8,
          total_power_savings: 14.6,
          optimized_yearly: { kwh: 214, carbon_kg: 102, trees_equivalent: 4.8 },
          top_processes: [
            { pid: 1234, name: 'Google Chrome', cpu: 18.2, memory: 12.5, memory_mb: 2048, category: 'browsers', is_idle: false, idle_duration: 0, cpu_sparkline: [15, 18, 12, 20, 16, 18], mem_sparkline: [11, 12, 12, 13, 12, 12.5], avg_cpu: 16.5, avg_mem: 12.1, status: 'running', threads: 42 },
            { pid: 5678, name: 'Spotify', cpu: 4.3, memory: 6.2, memory_mb: 1016, category: 'media', is_idle: false, idle_duration: 0, cpu_sparkline: [5, 4, 3, 4, 5, 4.3], mem_sparkline: [6, 6, 6.1, 6.2, 6, 6.2], avg_cpu: 4.2, avg_mem: 6.1, status: 'running', threads: 18 },
          ],
          suggestions: [],
          idle_summary: { count: 0, total_memory_percent: 0, names: [] },
          history: { cpu: [10, 12], memory: [76, 77], power: [40, 42], carbon: [4, 4.2] },
        });
      }

      if (!cancelled) {
        timeoutId = setTimeout(fetchMetrics, 3000);
      }
    };

    fetchMetrics();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050706' }}>
      <AnimatedActivity size={48} color="var(--accent-neon)" />
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

  const idleCount = data.idle_summary?.count || 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '2.5rem 1.5rem', backgroundColor: 'var(--bg-primary)', color: 'white', overflowX: 'hidden' }}>

      {/* DASHBOARD HEADER */}
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.03em' }}>System <span className="text-neon">Telemetry</span></h2>
          <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isMockData ? 'var(--warn-color)' : (connectionMode === 'local' ? 'var(--accent-neon)' : '#3b82f6') }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              SOURCE: {connectionMode} ({isMockData ? 'MOCK' : 'LIVE'}) // {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: '30px',
            background: 'rgba(0,0,0,0.3)',
            border: isMockData ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(46, 204, 113, 0.3)',
            boxShadow: isMockData ? '0 0 15px rgba(251, 191, 36, 0.05)' : '0 0 15px rgba(46, 204, 113, 0.05)',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: isMockData ? 'var(--warn-color)' : 'var(--accent-neon)' }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: isMockData ? '#fbbf24' : 'var(--accent-neon)' }}>
            {isMockData ? 'MOCK SYSTEM' : 'LIVE TELEMETRY'}
          </span>
        </motion.div>
      </div>

      {connectionMode !== 'local' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'rgba(233, 174, 73, 0.03)',
            border: '1px solid rgba(233, 174, 73, 0.1)',
            padding: '14px 24px',
            borderRadius: '16px',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} color="var(--warn-color)" />
          <span style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'white', marginRight: '8px' }}>Demo Mode:</strong> 
            Currently showing server-side or mock metrics. To monitor your own hardware in real-time, please clone and run the stack locally.
          </span>
        </motion.div>
      )}

      {/* DASHBOARD GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid-dashboard"
      >

        {/* 1. CARBON FOOTPRINT */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-4 row-span-2" style={{ ...cardStyle }}>
          <SmallLabel>CARBON FOOTPRINT</SmallLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '20px 0' }}>
            <h2 className="metric-large">
              <AnimatedNumber value={data.carbon_per_hour} fractionDigits={1} />
            </h2>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>gCO₂/hr</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
            Real-time emission translation based on current {data.power.toFixed(0)}W draw.
          </p>
          <WavyLineChart value={data.carbon_per_hour * 10} />
        </motion.div>

        {/* 2. CARBON OPTIMIZATION */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-4 row-span-2" style={{ ...cardStyle }}>
          <CarbonComparison
            currentPower={data.power}
            optimizedPower={data.optimized_power}
            currentCarbon={data.carbon_per_hour}
            optimizedCarbon={data.optimized_carbon_per_hour}
            totalSavings={data.total_power_savings}
            currentYearly={data.current_yearly}
            optimizedYearly={data.optimized_yearly}
          />
        </motion.div>

        {/* 3. CPU LOAD */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-2" style={{ ...cardStyle }}>
          <SmallLabel>CPU LOAD</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.cpu.total.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.cpu.total} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {data.cpu.frequency > 0 ? `${data.cpu.frequency.toFixed(1)} GHz` : 'Apple Silicon'} // {data.cpu.per_core?.length || 0} cores
          </div>
        </motion.div>

        {/* 4. MEMORY */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-2" style={{ ...cardStyle }}>
          <SmallLabel>MEMORY</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.memory.used.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>GB</span></div>
          <MetricBar value={data.memory.percent} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Available: {(data.memory.total - data.memory.used).toFixed(1)} GB</div>
        </motion.div>

        {/* 5. GPU UTILIZATION */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-2" style={{ ...cardStyle }}>
          <SmallLabel>GPU UTILIZATION</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.gpu.usage.toFixed(0)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.gpu.usage} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{data.gpu.usage < 10 ? 'Idle' : data.gpu.usage < 50 ? 'Moderate' : 'Heavy'} // {data.power_breakdown.gpu.toFixed(0)}W</div>
        </motion.div>

        {/* 6. BATTERY HEALTH */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-2" style={{ ...cardStyle }}>
          <SmallLabel>BATTERY HEALTH</SmallLabel>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '12px 0 8px' }}>{data.battery.percent} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span></div>
          <MetricBar value={data.battery.percent} height="5px" />
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: data.battery.plugged ? 'var(--accent-neon)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {data.battery.plugged ? '⚡ Charging' : '🔋 On Battery'}
          </div>
        </motion.div>

        {/* 7. INTELLIGENT OPTIMIZATION */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-8 row-span-2" style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <SmallLabel>INTELLIGENT OPTIMIZATION</SmallLabel>
            {idleCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                }}
              >
                <span style={{ fontSize: '0.6rem' }}>💤</span>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                }}>
                  {idleCount} IDLE · {data.idle_summary?.total_memory_percent?.toFixed(0) || 0}% MEM
                </span>
              </motion.div>
            )}
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 20px', letterSpacing: '-0.01em' }}>
            Resource Hog Detection
          </h3>

          <ProcessTable processes={data.top_processes || []} />
        </motion.div>

        {/* 8. POWER DRAW ANALYSIS */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-4 row-span-2" style={{ ...cardStyle }}>
          <SmallLabel>POWER DRAW ANALYSIS</SmallLabel>
          <div className="metric-large" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '20px', marginBottom: '12px' }}>
            <AnimatedNumber value={data.power} /> <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Watts</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-telemetry)', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Signal size={16} />
            </motion.div>
            {data.total_power_savings > 0
              ? `↓ ${data.total_power_savings.toFixed(0)}W savable`
              : '● Optimal'
            }
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.6 }}>Current combined system wattage consumption.</p>

          <div className="power-breakdown-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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

        {/* 9. SYSTEM INSIGHTS FEED */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-8" style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <SmallLabel>SYSTEM INSIGHTS & RECOMMENDATIONS</SmallLabel>
            <div style={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: 'var(--text-telemetry)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: '0 0 8px var(--accent-neon)' }}
              />
              {data.suggestions?.length || 0} ACTIVE INSIGHTS
            </div>
          </div>
          <InsightsPanel suggestions={data.suggestions || []} />
        </motion.div>

        {/* 10. DISK USAGE */}
        <motion.div variants={itemVariants} {...hoverProps} className="col-span-4" style={{ ...cardStyle }}>
          <SmallLabel>DISK USAGE</SmallLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
            <HardDrive size={28} color="var(--accent-neon)" style={{ flexShrink: 0, opacity: 0.8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {data.disk?.percent?.toFixed(0) || 0}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>%</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  {data.disk?.used?.toFixed(0) || 0} / {data.disk?.total?.toFixed(0) || 0} GB
                </div>
              </div>
              <MetricBar value={data.disk?.percent || 0} height="5px" segmented={false} />
            </div>
          </div>
          <div style={{ marginTop: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {data.disk?.free?.toFixed(0) || 0} GB free
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
