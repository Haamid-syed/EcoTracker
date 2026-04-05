import { motion } from 'framer-motion';
import { Terminal, Cpu, Zap, Signal, Info, BookOpen, Link } from 'lucide-react';

const cardStyle = {
  background: 'var(--bg-card)',
  borderRadius: '24px',
  border: '1px solid var(--border-glass)',
  padding: '32px',
  position: 'relative' as const,
};

export default function Documentation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' } }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '120px 2rem 80px' }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        {/* Header */}
        <motion.div variants={itemVariants} style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(46, 204, 113, 0.1)',
            padding: '8px 16px',
            borderRadius: '40px',
            border: '1px solid rgba(46, 204, 113, 0.2)',
            marginBottom: '2rem'
          }}>
            <BookOpen size={16} color="var(--accent-neon)" />
            <span style={{ color: 'var(--accent-neon)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>PROTOCOL V1.0</span>
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
            OPERATING <span style={{ color: 'var(--accent-neon)' }}>MANUAL</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Understanding the underlying architecture of Eco-Tracker's carbon telemetry and hardware polling loop.
          </p>
        </motion.div>

        {/* Section 1: How to Connect */}
        <motion.div variants={itemVariants} style={{ marginBottom: '4rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <Terminal size={32} color="var(--accent-neon)" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', margin: 0 }}>HOW TO CONNECT</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '32px' }}>
              The Eco-Tracker dashboard requires a local backend instance to poll your system hardware. Without this, it runs in <strong>Mock Mode</strong>.
            </p>

            <div style={{ background: '#0a0f0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', position: 'relative' }}>
              <div style={{ color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '16px', opacity: 0.6 }}>SYSTEM INITIALIZATION:</div>
              <code style={{ display: 'block', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: 2 }}>
                # 1. Install all dependencies from root<br />
                <span style={{ color: 'var(--accent-neon)' }}>$</span> npm run install:all<br /><br />
                # 2. Boot the full telemetry stack<br />
                <span style={{ color: 'var(--accent-neon)' }}>$</span> npm run dev
              </code>
            </div>

            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Link size={14} color="var(--accent-neon)" /> ENDPOINT
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>The frontend polls <code>localhost:8000/api/metrics</code> every 2 seconds.</p>
              </div>
              <div>
                <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Signal size={14} color="var(--accent-neon)" /> STATUS INDICATOR
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Check the top-right badge on the Dashboard. <strong>"LIVE"</strong> means success.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: High Level Architecture */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <Cpu size={24} color="var(--accent-neon)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>TELEMETRY PIPELINE</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              The backend uses <code>psutil</code> to hook into kernel-level performance counters. It collects low-level data on CPU cycle deltas, memory addresses, and thermal discharge to build a real-time power model.
            </p>
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(46, 204, 113, 0.05)', borderRadius: '12px', border: '1px dashed rgba(46, 204, 113, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-neon)', letterSpacing: '0.1em' }}>
                <span>POLLING INTERVAL</span>
                <span>2000MS</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <Zap size={24} color="var(--accent-neon)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>CARBON ENGINE</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
              Watts are converted to CO₂ using the formula:<br />
              <code style={{ color: 'white', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>W * (CarbonIntensity / 1000) = gCO₂/hr</code>
            </p>
            <div style={{ marginTop: '15px', fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>
              *Default intensity is tuned to the India Power Grid average (0.82 kg/kWh).
            </div>
          </div>

        </motion.div>

        {/* Section 3: Logic Overview */}
        <motion.div variants={itemVariants} style={{ marginTop: '1.5rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '24px' }}>
              <Info size={24} color="var(--accent-neon)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>CORE LOGIC</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
               <div style={{ opacity: 0.8 }}>
                 <h4 style={{ color: 'var(--accent-neon)', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '12px' }}>CONSERVATIVE IDLE</h4>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                   We use CPU Time Delta tracking. A process isn't "idle" just because CPU usage is low; it's idle only if its execution time remains static for 300 seconds.
                 </p>
               </div>
               <div style={{ opacity: 0.8 }}>
                 <h4 style={{ color: 'var(--accent-neon)', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '12px' }}>INTELLIGENT FILTERS</h4>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                   Browsers, IDEs, and Communication apps are automatically exempted from idle-flagging to prevent user disruption while actively working.
                 </p>
               </div>
               <div style={{ opacity: 0.8 }}>
                 <h4 style={{ color: 'var(--accent-neon)', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '12px' }}>METRIC RANKING</h4>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                   Top Processes are ranked by <code>Resource Pressure</code> = (CPU% + Memory%) to identify the true hogs of your system energy.
                 </p>
               </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
