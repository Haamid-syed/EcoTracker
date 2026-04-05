import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Layers, ArrowUp, ArrowRight } from 'lucide-react';
import { AnimatedActivity } from './components/AnimatedActivity';
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
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            const isMobile = canvas.width < 768;
            const xPos = isMobile ? canvas.width * 0.5 : canvas.width * 0.75;
            ctx.translate(xPos, canvas.height * 0.5);

            time += 0.015;

            const items = [];
            const totalPoints = 60;
            const spacing = 45; 
            const amplitude = isMobile ? Math.min(canvas.width * 0.4, 220) : 220; 
            const frequency = 0.08; 

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

import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
            <DNABackground />

            {/* Hero Content */}
            <div className="hero-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', zIndex: 10, position: 'relative' }}>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="hero-title"
                    style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', lineHeight: '0.9', textAlign: 'center', fontWeight: 900, margin: 0, letterSpacing: '-0.04em', textTransform: 'uppercase', maxWidth: '1200px' }}
                >
                    <span style={{ color: 'white' }}>CYBER-ORGANIC</span>
                    <br />
                    <span style={{ color: 'var(--accent-neon)', fontStyle: 'italic', fontWeight: 800, letterSpacing: '-0.02em', filter: 'drop-shadow(0 0 20px rgba(46, 204, 113, 0.2))' }}>INTELLIGENCE</span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textAlign: 'center', maxWidth: '700px', marginTop: '2.5rem', lineHeight: '1.7', fontWeight: 500 }}
                >
                    Rewriting the telemetry of hardware efficiency. Monitoring carbon velocity through advanced neural-mapped heuristics.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="hero-buttons-container"
                    style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'var(--accent-neon)',
                            color: '#050b09',
                            padding: '18px 42px',
                            minWidth: '220px',
                            borderRadius: '40px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.1em',
                            boxShadow: '0 10px 30px rgba(46, 204, 113, 0.4), 0 0 20px rgba(46, 204, 113, 0.2)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(46, 204, 113, 0.5), 0 0 30px rgba(46, 204, 113, 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(46, 204, 113, 0.4), 0 0 20px rgba(46, 204, 113, 0.2)';
                        }}
                    >
                        Dashboard <AnimatedActivity size={20} />
                    </button>

                    <button
                        onClick={() => navigate('/documentation')}
                        style={{
                            background: 'rgba(52, 211, 153, 0.05)',
                            color: 'white',
                            padding: '18px 42px',
                            minWidth: '220px',
                            borderRadius: '40px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '0.1em',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.3)';
                        }}
                    >
                        Documentation <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>

            {/* Architectural Features Section */}
            <ArchitecturalFeatures />

        </div>
    );
};

function ArchitecturalFeatures() {
    return (
        <div className="features-container">
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
                        CORE CAPABILITIES
                    </div>
                    <h2 style={{ fontSize: '3.5rem', margin: 0, fontWeight: 700, color: '#f0fdf4', letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                        HOW IT <span style={{ color: 'rgba(255,255,255,0.7)' }}>WORKS</span>
                    </h2>
                </div>
                <p style={{ maxWidth: '400px', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                    Polling system hardware via psutil to calculate real-time power draw and carbon emissions from your laptop's actual resource usage.
                </p>
            </motion.div>

            {/* Grid */}
            <div className="grid-landing">

                {/* Column 1: Left Stack (6/12) */}
                <div className="col-span-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            <AnimatedActivity size={24} color="var(--accent-neon)" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>REAL-TIME TELEMETRY</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem', margin: 0, maxWidth: '85%' }}>
                            Monitors CPU load, memory pressure, GPU utilization, battery health, and disk usage with per-core breakdown and frequency tracking.
                        </p>
                    </motion.div>

                    {/* Carbon Footprint Calculation box */}
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
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>CARBON FOOTPRINT</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Translating watts into grams of CO₂ per hour.</p>
                            </div>
                            <div style={{ color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>
                                gCO₂/hr
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                <span>CPU + GPU POWER</span>
                                <span>72%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.8rem' }}>
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} style={{ height: '100%', background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                                <span>DISPLAY + IDLE</span>
                                <span>28%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div initial={{ width: 0 }} whileInView={{ width: '28%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.7 }} style={{ height: '100%', background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)' }} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Column 2: Middle Stack (3/12) */}
                <div className="col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Idle Process Detection box */}
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>IDLE DETECTION</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                            Tracks CPU time deltas to find processes with zero activity for 5+ minutes. Only flags non-interactive apps — never bluffs.
                        </p>
                    </motion.div>

                    {/* Optimization Comparison box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="glass-panel"
                        style={{ background: 'rgba(16, 32, 27, 0.4)', padding: '2.5rem' }}
                    >
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                            OPTIMIZATION ENGINE
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.8rem' }}>
                            <ArrowUp color="var(--accent-neon)" size={28} strokeWidth={3} />
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: '0.3rem' }}>−15W</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>AVG. SAVINGS</div>
                            </div>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', lineHeight: '1.5', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Compares current vs. optimized power draw based on real metrics.
                        </p>
                    </motion.div>
                </div>

                {/* Column 3: Right Stack (3/12) */}
                <div className="col-span-3" style={{ display: 'flex', flexDirection: 'column' }}>
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'white', letterSpacing: '0.02em', textTransform: 'uppercase' }}>PROCESS INSIGHTS</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
                            Top-5 resource consumers with sparkline trends, category badges, and per-process power cost breakdown.
                        </p>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '3rem' }}>
                            {[
                                { label: 'CPU %', value: '18.2', trend: '↗' },
                                { label: 'MEM', value: '2.1 GB', trend: '→' },
                                { label: 'THREADS', value: '42', trend: '↘' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.6 + (i * 0.1) }}
                                    style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{stat.label}</span>
                                    <span style={{ color: 'var(--accent-neon)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>{stat.value} {stat.trend}</span>
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
