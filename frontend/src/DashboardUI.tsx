import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface MetricsData {
  cpu: { total: number; frequency: number; per_core: number[] };
  memory: { percent: number; used: number; total: number };
  gpu: { available: boolean; usage: number };
  battery: { available: boolean; percent: number; plugged: boolean };
  power: number;
  carbon_per_hour: number;
}

const AnimatedNumber = ({ value, fractionDigits = 1 }: { value: number; fractionDigits?: number }) => {
  return <span>{value.toFixed(fractionDigits)}</span>;
};

const MiniChart = ({ value, barCount = 10 }: { value: number; barCount?: number }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '64px', marginTop: '1rem', marginBottom: '1rem' }}>
      {Array.from({ length: barCount }).map((_, i) => {
        // We amplify the value sensitivity so small changes in the metrics result in 
        // dramatic visual shifts in the bars.
        const amplifiedValue = Math.pow(value / 100, 0.7) * 110; 
        const curveOffset = Math.sin(i * 1.8) * 18 + ((i % 3) * 8) - 10;
        const targetHeight = Math.max(10, Math.min(100, amplifiedValue + curveOffset));
        
        return (
          <motion.div
            key={i}
            animate={{
              height: `${targetHeight}%`,
              opacity: 0.6 + (targetHeight / 100) * 0.4
            }}
            transition={{
              type: 'spring',
              stiffness: 70,  // Smooth, organic response to data changes
              damping: 15,    // Damping prevents erratic bouncing
              mass: 1
            }}
            style={{
              flex: 1,
              maxWidth: '12px',
              minWidth: '4px',
              borderRadius: '4px',
              backgroundColor: 'var(--accent-neon)',
              boxShadow: '0 0 12px var(--accent-neon)',
              transformOrigin: 'bottom'
            }}
          />
        );
      })}
    </div>
  );
};

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
          // Fallback demo data if API is down
          setData({
            cpu: { total: 42 + (Math.random() * 10 - 5), frequency: 5.2, per_core: [] },
            memory: { percent: 0, used: 12.4 + (Math.random() * 0.5 - 0.25), total: 32 },
            gpu: { available: true, usage: 30 + (Math.random() * 20 - 10) },
            battery: { available: true, percent: 98, plugged: false },
            power: 84.2 + (Math.random() * 2 - 1),
            carbon_per_hour: 12.16 + (Math.random() * 0.2 - 0.1)
          });
        });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity className="glow-animation" size={48} color="var(--accent-neon)" /></div>;

  const glassStyle = { background: 'rgba(10, 20, 15, 0.4)', borderRadius: '16px', border: '1px solid rgba(52,211,153,0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column' as const, transition: 'all 0.3s ease' };
  const hoverProps = { whileHover: { scale: 1.02, borderColor: 'rgba(52, 211, 153, 0.4)', boxShadow: '0 8px 32px rgba(52,211,153,0.15)' }, transition: { type: 'spring' as const, stiffness: 400, damping: 30 } };

  const labelStyle = { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--text-secondary)', marginBottom: '0.5rem' };
  const subTextStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 4rem', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Main Impact Box */}
          <motion.div {...hoverProps} style={{ ...glassStyle, flex: 1, padding: '2.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              TX: 0.1ms // DB: SYNC
            </div>
            <div style={{ color: 'var(--accent-neon)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1rem' }}>REAL-TIME ENVIRONMENTAL IMPACT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
              <motion.h1 layout style={{ fontSize: '5.5rem', margin: 0, lineHeight: 1, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white', textShadow: '0 0 40px rgba(52,211,153,0.4)' }}>
                <AnimatedNumber value={data.carbon_per_hour} fractionDigits={2} />
              </motion.h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>g CO₂/hr</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '300px', lineHeight: 1.5 }}>
              Currently translating system wattage into actionable carbon metrics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 'auto', paddingTop: '3rem' }}>
              <div>
                <div style={labelStyle}>TOTAL POWER</div>
                <motion.div layout style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{data.power.toFixed(1)} W</motion.div>
              </div>
              <div>
                <div style={labelStyle}>EFFICIENCY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>94.2%</div>
              </div>
              <div>
                <div style={labelStyle}>CORE TEMP</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>42°C</div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Left 3 Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <motion.div {...hoverProps} style={glassStyle}>
              <div style={labelStyle}>GPU CLOCK</div>
              <motion.div layout style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>1420 MHz</motion.div>
              <MiniChart value={data.gpu.available ? data.gpu.usage : 0} />
              <div style={{ ...subTextStyle, marginTop: 'auto' }}>RENDERING IDLE</div>
            </motion.div>

            <motion.div {...hoverProps} style={{ ...glassStyle, background: 'linear-gradient(180deg, rgba(16, 32, 27, 0.4) 0%, rgba(52, 211, 153, 0.05) 100%)' }}>
              <div style={labelStyle}>YEARLY PROJECTION</div>
              <div style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>🌲</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>12 Trees</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Carbon absorption equivalent based on your current power footprint.
              </div>
            </motion.div>

            <motion.div {...hoverProps} style={glassStyle}>
              <div style={labelStyle}>BATTERY STATE</div>
              <motion.div layout style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{data.battery.percent.toFixed(0)}%</motion.div>
              <MiniChart value={data.battery.percent} barCount={8} />
              <div style={{ ...subTextStyle, marginTop: 'auto' }}>HEALTH: OPTIMAL</div>
            </motion.div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top Right 2 Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <motion.div {...hoverProps} style={glassStyle}>
              <div style={labelStyle}>CPU UTILIZATION</div>
              <motion.div layout style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{data.cpu.total.toFixed(0)}%</motion.div>
              <MiniChart value={data.cpu.total} />
              <div style={{ ...subTextStyle, marginTop: 'auto' }}>5.2 GHZ · 12 CORES</div>
            </motion.div>
            <motion.div {...hoverProps} style={glassStyle}>
              <div style={labelStyle}>RAM LOAD</div>
              <motion.div layout style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{data.memory.used.toFixed(1)} GB</motion.div>
              <MiniChart value={(data.memory.used / data.memory.total) * 100} />
              <div style={{ ...subTextStyle, marginTop: 'auto' }}>32GB LPDDR5X</div>
            </motion.div>
          </div>

          {/* AI Optimization Hub */}
          <motion.div {...hoverProps} style={{ ...glassStyle, flex: 1, padding: '2.5rem' }}>
            <div style={{ color: 'var(--accent-neon)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              AI OPTIMIZATION HUB
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '2rem', letterSpacing: '0.02em' }}>
              3 Potential Power Reductions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', borderLeft: '3px solid #ef4444' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Google Chrome</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Resource Hog - 8.5W Drain</div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'var(--accent-neon)', color: 'black', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  Save 4.0g
                </motion.button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.1)', borderLeft: '3px solid var(--accent-neon)' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Adobe Creative Cloud</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Background Task - 2.1W Drain</div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'var(--accent-neon)', color: 'black', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  Hibernating
                </motion.button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.1)', borderLeft: '3px solid var(--accent-neon)' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Electron (Slack)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Idle Leak - 1.4W Drain</div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'var(--accent-neon)', color: 'black', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  Optimize
                </motion.button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
