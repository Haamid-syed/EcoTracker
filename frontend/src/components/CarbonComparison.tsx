import { motion } from 'framer-motion';
import { SmallLabel } from './Visuals';

interface CarbonComparisonProps {
  currentPower: number;
  optimizedPower: number;
  currentCarbon: number;
  optimizedCarbon: number;
  totalSavings: number;
  currentYearly: { kwh: number; carbon_kg: number; trees_equivalent: number };
  optimizedYearly: { kwh: number; carbon_kg: number; trees_equivalent: number };
}

/**
 * Animated arc gauge that shows current vs optimized as a ring segment.
 */
const ArcGauge = ({ current, optimized, max }: { current: number; optimized: number; max: number }) => {
  const size = 140;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const currentPercent = Math.min(current / max, 1);
  const optimizedPercent = Math.min(optimized / max, 1);
  const optimizedDash = circumference * optimizedPercent;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        {/* Optimized (target) ring - dimmer */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(46, 204, 113, 0.2)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - optimizedDash }}
          transition={{ duration: 1.5, delay: 0.3, type: 'spring', stiffness: 30 }}
          strokeLinecap="round"
        />
        {/* Current ring - bright */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius - stroke - 2}
          fill="none"
          stroke="var(--accent-neon)"
          strokeWidth={stroke - 2}
          strokeDasharray={2 * Math.PI * (radius - stroke - 2)}
          initial={{ strokeDashoffset: 2 * Math.PI * (radius - stroke - 2) }}
          animate={{ strokeDashoffset: 2 * Math.PI * (radius - stroke - 2) * (1 - currentPercent) }}
          transition={{ duration: 1.5, type: 'spring', stiffness: 30 }}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(46, 204, 113, 0.4))' }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'white',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1,
        }}>
          {current.toFixed(0)}
        </div>
        <div style={{
          fontSize: '0.5rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}>
          WATTS
        </div>
      </div>
    </div>
  );
};

export const CarbonComparison = ({
  currentPower,
  optimizedPower,
  currentCarbon,
  optimizedCarbon,
  totalSavings,
  currentYearly,
  optimizedYearly,
}: CarbonComparisonProps) => {
  const savingsPercent = currentPower > 0 ? ((currentPower - optimizedPower) / currentPower * 100) : 0;
  const carbonDelta = currentCarbon - optimizedCarbon;
  const yearlySavingsKg = (currentYearly?.carbon_kg || 0) - (optimizedYearly?.carbon_kg || 0);
  const treesSaved = yearlySavingsKg > 0 ? (yearlySavingsKg / 21) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SmallLabel>CARBON OPTIMIZATION</SmallLabel>

      {/* Gauge */}
      <div style={{ margin: '16px 0' }}>
        <ArcGauge current={currentPower} optimized={optimizedPower} max={150} />
      </div>

      {/* Current vs Optimized */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', margin: '8px 0 16px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '0.5rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            CURRENT
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)' }}>
            {currentCarbon.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            gCO₂/hr
          </div>
        </div>

        {/* Delta arrow */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              fontSize: '1.2rem',
              color: carbonDelta > 0 ? 'var(--accent-neon)' : 'var(--text-muted)',
            }}
          >
            →
          </motion.div>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '0.5rem',
            color: 'var(--accent-neon)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            OPTIMIZED
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)' }}>
            {optimizedCarbon.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            gCO₂/hr
          </div>
        </div>
      </div>

      {/* Savings Banner */}
      {totalSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(46, 204, 113, 0.06)',
            border: '1px solid rgba(46, 204, 113, 0.15)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontSize: '0.5rem',
                color: 'var(--accent-neon)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                marginBottom: '4px',
              }}>
                POTENTIAL SAVINGS
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                {savingsPercent.toFixed(0)}% reduction possible
              </div>
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--accent-neon)',
              fontFamily: 'var(--font-mono)',
              textShadow: '0 0 12px rgba(46, 204, 113, 0.3)',
            }}>
              −{totalSavings.toFixed(0)}W
            </div>
          </div>
        </motion.div>
      )}

      {/* Yearly Impact */}
      <div style={{
        marginTop: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)' }}>
            {(currentYearly?.kwh || 0).toFixed(0)}
          </div>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            kWh/YEAR
          </div>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)' }}>
            {treesSaved.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            TREES SAVED
          </div>
        </div>
      </div>
    </div>
  );
};
