import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Box, Layers, ArrowUp } from 'lucide-react';
import './index.css';

const DNABackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const letters = ['A', 'C', 'T', 'G'];
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Move to right side where DNA is in the screenshot
      ctx.translate(canvas.width * 0.75, canvas.height * 0.5);

      time += 0.015;

      const items = [];
      const totalPoints = 60;
      const spacing = 45; // vertical gap
      const amplitude = 220; // width of helix
      const frequency = 0.08; // tightness of twist

      for (let i = -totalPoints / 2; i < totalPoints / 2; i++) {
        const y = i * spacing;
        const phase = i * frequency + time;

        const x1 = Math.cos(phase) * amplitude;
        const z1 = Math.sin(phase) * amplitude;
        const x2 = Math.cos(phase + Math.PI) * amplitude;
        const z2 = Math.sin(phase + Math.PI) * amplitude;

        items.push({
          y, x1, z1, x2, z2,
          l1: letters[(i + totalPoints * 2) % 4],
          l2: letters[(i + 2 + totalPoints * 2) % 4],
          avgZ: (z1 + z2) / 2
        });
      }

      // Sort by Z to draw back to front
      items.sort((a, b) => a.avgZ - b.avgZ);

      items.forEach(item => {
        // Draw the line
        const opacityLine = Math.max(0.02, 0.08 + (item.avgZ / amplitude) * 0.12);
        ctx.beginPath();
        ctx.moveTo(item.x1, item.y);
        ctx.lineTo(item.x2, item.y);
        ctx.strokeStyle = `rgba(52, 211, 153, ${opacityLine})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw points
        const drawPoint = (x: number, z: number, l: string) => {
          const zNorm = (z + amplitude) / (amplitude * 2); // 0 to 1
          const alpha = 0.15 + zNorm * 0.85;
          const fontSize = 10 + zNorm * 14;
          ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
          // Subtle glow effect for front letters
          if (zNorm > 0.8) {
             ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
             ctx.shadowBlur = 10;
          } else {
             ctx.shadowBlur = 0;
          }
          ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(l, x, item.y);
        };

        drawPoint(item.x1, item.z1, item.l1);
        drawPoint(item.x2, item.z2, item.l2);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        position: 'fixed'
      }}
    />
  );
};

export const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <DNABackground />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 4rem', zIndex: 10, position: 'relative' }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.05em', color: 'white', fontFamily: 'var(--font-heading)' }}>
          <div style={{ background: 'white', color: 'black', padding: '0.3rem', borderRadius: '4px', display: 'flex' }}>
            <Activity size={20} strokeWidth={3} />
          </div>
          ECO_TRACKER
        </div>
        
        {/* Middle */}
        <div style={{ display: 'flex', gap: '3rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', color: 'white', transition: 'color 0.2s' }}>FEATURES</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">INTERFACE</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">CONTACT</span>
        </div>
        
        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '8px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-neon)', boxShadow: 'var(--accent-glow)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>SYSTEM ACTIVE</span>
          </div>
          <button style={{ background: 'white', color: 'black', padding: '12px 28px', borderRadius: '30px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: 'none', letterSpacing: '0.05em', transition: 'transform 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            GET STARTED
          </button>
        </div>
      </motion.nav>
      
      {/* Hero Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', zIndex: 10, position: 'relative' }}>
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--accent-neon)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', padding: '8px 20px', borderRadius: '30px', marginBottom: '2.5rem' }}
        >
          V.0.4.9 — STABLE RELEASE
        </motion.div>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ fontSize: 'clamp(4rem, 8vw, 7.5rem)', lineHeight: '0.9', textAlign: 'center', fontWeight: 500, margin: 0, fontFamily: 'var(--font-body)', letterSpacing: '-0.02em' }}
        >
          <span style={{ color: 'white' }}>CYBER-ORGANIC</span>
          <br />
          <span style={{ color: 'var(--accent-neon)', fontStyle: 'italic', fontWeight: 700, letterSpacing: '-0.04em' }}>INTELLIGENCE</span>
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ color: 'var(--text-muted)', fontSize: '1.25rem', textAlign: 'center', maxWidth: '650px', marginTop: '2.5rem', lineHeight: '1.6', fontWeight: 400 }}
        >
          Rewriting the telemetry of hardware efficiency. Monitoring carbon velocity through advanced neural-mapped heuristics.
        </motion.p>
        
        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}
        >
          <button onClick={onEnter} style={{ background: 'var(--accent-neon)', color: '#050b09', padding: '16px 32px', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)', fontFamily: 'var(--font-body)' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 30px rgba(16, 185, 129, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)'; }}
          >
            ENTER DASHBOARD <span style={{fontSize: '1.2rem', marginLeft: '4px'}}>→</span>
          </button>
          <button style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', color: 'var(--text-muted)', padding: '16px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
          >
            WATCH PROTOCOL V0.1
          </button>
        </motion.div>
      </div>
      
      {/* Telemetry Stream */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        style={{ position: 'absolute', bottom: '3rem', left: '4rem', fontFamily: 'var(--font-mono)', zIndex: 10 }}
      >
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.2rem', fontWeight: 700 }}>
          TELEMETRY STREAM
        </div>
        <div style={{ color: 'var(--accent-neon)', fontSize: '0.85rem', lineHeight: '1.8', letterSpacing: '0.05em' }}>
          0x4A82 // CPU LOAD: 42.4%<br/>
          0x91F0 // POWER: 142.0W<br/>
          0x2CC1 // TEMP: 38.5C
        </div>
      </motion.div>
      
      {/* Architectural Features Section */}
      <ArchitecturalFeatures />
      
    </div>
  );
};

const ArchitecturalFeatures = () => {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 4rem 8rem 4rem', position: 'relative', zIndex: 10 }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}
      >
        <div>
          <div style={{ color: 'var(--accent-neon)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            INTEGRATED INTELLIGENCE
          </div>
          <h2 style={{ fontSize: '3.5rem', margin: 0, fontWeight: 700, color: '#f0fdf4', letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            ARCHITECTURAL <span style={{ color: 'rgba(255,255,255,0.7)' }}>FEATURES</span>
          </h2>
        </div>
        <p style={{ maxWidth: '400px', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Harnessing low-level system hooks and generative AI to deliver the most comprehensive ecological telemetry dashboard ever built.
        </p>
      </motion.div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        {/* Column 1: Left Stack (6/12) */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Real-time Telemetry box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel" 
            style={{ flex: 1, background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Activity size={24} color="var(--accent-neon)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>REAL-TIME TELEMETRY</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem', margin: 0, maxWidth: '85%' }}>
              Deep integration with kernel-level performance counters for CPU, GPU, and RAM power profiling.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: '4px', height: '20px', background: 'var(--accent-neon)', borderRadius: '2px', boxShadow: '0 0 10px var(--accent-neon)' }}
              />
            </div>
          </motion.div>

          {/* Power Draw Analysis box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel" 
            style={{ background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>POWER DRAW ANALYSIS</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Sub-millisecond polling of battery discharge rates.</p>
              </div>
              <div style={{ color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>
                142.0W
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                <span>HARDWARE CORE</span>
                <span>82%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.8rem' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: '82%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                <span>DISPLAY MATRIX</span>
                <span>18%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: '18%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.7 }} style={{ height: '100%', background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)' }} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Column 2: Middle Stack (3/12) */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Impact Engine box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel" 
            style={{ flex: 1, background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem' }}
          >
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Box size={24} color="var(--accent-neon)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>IMPACT ENGINE</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
              Dynamic CO2 calculations based on local power grid carbon intensity data.
            </p>
          </motion.div>

          {/* Yearly Projection box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel" 
            style={{ background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem' }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              YEARLY PROJECTION
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.8rem' }}>
              <ArrowUp color="var(--accent-neon)" size={28} strokeWidth={3} />
              <div>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: '0.3rem' }}>14.2</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>TREES REQUIRED</div>
              </div>
            </div>
             <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: '1.5', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OFFSET CALCULATION BASED ON 2,400 USAGE HOURS.
            </p>
          </motion.div>
        </div>

        {/* Column 3: Right Stack (3/12) */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel" 
            style={{ flex: 1, background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ background: 'rgba(52, 211, 153, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <Layers size={24} color="var(--accent-neon)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>AI OPTIMIZATION</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
              Heuristic detection of resource-heavy background processes.
            </p>
            
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '3rem' }}>
              {[
                { name: 'chrome.exe', status: 'SUSPENDED', color: 'var(--accent-neon)' },
                { name: 'docker.bin', status: 'THROTTLED', color: 'var(--accent-neon)' },
                { name: 'figma.node', status: 'OPTIMIZED', color: 'var(--accent-neon)' }
              ].map((proc, i) => (
                <motion.div 
                  key={proc.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + (i * 0.1) }}
                  style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{proc.name}</span>
                  <span style={{ color: proc.color, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>{proc.status}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
