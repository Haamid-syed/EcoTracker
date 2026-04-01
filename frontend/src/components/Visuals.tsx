import { motion } from 'framer-motion';

/**
 * A reactive SVG path that creates a "breathing" wave animation.
 * The depth of the wave can be modulated by the 'value' prop.
 */
export const WavyLineChart = ({ value = 50 }: { value?: number }) => {
  // Normalize the value to a sensitivity range for the wave height
  const amplitude = Math.max(5, Math.min(25, (value / 100) * 30));
  
  return (
    <div style={{ width: '100%', height: '80px', marginTop: 'auto', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
        <motion.path
          d="M 0 50 Q 50 20 100 50 T 200 50 T 300 50 T 400 50"
          fill="transparent"
          stroke="var(--accent-neon)"
          strokeWidth="3"
          animate={{
            d: [
              `M 0 60 Q 50 ${60 - amplitude} 100 60 T 200 60 T 300 60 T 400 60`,
              `M 0 60 Q 50 ${60 + amplitude} 100 60 T 200 60 T 300 60 T 400 60`,
              `M 0 60 Q 50 ${60 - amplitude} 100 60 T 200 60 T 300 60 T 400 60`,
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ filter: 'drop-shadow(0 0 8px var(--accent-neon))' }}
        />
      </svg>
    </div>
  );
};

interface MetricBarProps {
  value: number;
  color?: string;
  height?: string;
}

/**
 * A sleek horizontal progress bar with a glowing tip.
 */
export const MetricBar = ({ value, color = 'var(--accent-neon)', height = '6px' }: MetricBarProps) => {
  return (
    <div style={{ 
      width: '100%', 
      height, 
      backgroundColor: 'rgba(255,255,255,0.05)', 
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{
          height: '100%',
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
          borderRadius: '10px',
          position: 'relative'
        }}
      >
        {/* Glowing tip */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '4px',
          backgroundColor: 'white',
          boxShadow: `0 0 15px white`,
          opacity: 0.8
        }} />
      </motion.div>
    </div>
  );
};

export const SmallLabel = ({ children, color = 'var(--text-muted)' }: { children: React.ReactNode; color?: string }) => (
  <div style={{ 
    fontSize: '0.6rem', 
    fontWeight: 700, 
    letterSpacing: '0.12em', 
    textTransform: 'uppercase', 
    color,
    marginBottom: '0.4rem',
    fontFamily: 'var(--font-mono)'
  }}>
    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, marginRight: '8px', verticalAlign: 'middle' }} />
    {children}
  </div>
);
