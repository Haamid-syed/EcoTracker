import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Moon, HardDrive, RefreshCw, Gamepad2, Battery, CheckCircle } from 'lucide-react';

interface Suggestion {
  type: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  processes: [string, number, string][];
  power_savings: number;
  carbon_savings: number;
  action: string;
}

const SEVERITY_CONFIG = {
  high: {
    borderColor: 'var(--crit-color)',
    bg: 'rgba(231, 76, 60, 0.04)',
    badgeBg: 'rgba(231, 76, 60, 0.15)',
    badgeColor: '#ef4444',
    label: 'CRITICAL',
    glow: '0 0 20px rgba(231, 76, 60, 0.1)',
  },
  medium: {
    borderColor: 'var(--warn-color)',
    bg: 'rgba(251, 191, 36, 0.03)',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    badgeColor: '#fbbf24',
    label: 'ADVISORY',
    glow: '0 0 20px rgba(251, 191, 36, 0.08)',
  },
  low: {
    borderColor: 'var(--accent-neon)',
    bg: 'rgba(46, 204, 113, 0.03)',
    badgeBg: 'rgba(46, 204, 113, 0.15)',
    badgeColor: 'var(--accent-neon)',
    label: 'OPTIMAL',
    glow: '0 0 20px rgba(46, 204, 113, 0.08)',
  },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  '⚡': <Zap size={16} />,
  '💤': <Moon size={16} />,
  '💾': <HardDrive size={16} />,
  '🔄': <RefreshCw size={16} />,
  '🎮': <Gamepad2 size={16} />,
  '🔋': <Battery size={16} />,
  '✅': <CheckCircle size={16} />,
};

export const InsightsPanel = ({ suggestions }: { suggestions: Suggestion[] }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{ fontSize: '1.2rem' }}>✅</div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--accent-neon)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.12em',
        }}>
          SYSTEM HEALTHY
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          maxWidth: '280px',
          lineHeight: 1.5,
        }}>
          No actionable issues detected. Your resource usage is within normal operating parameters.
        </div>
      </div>
    );
  }

  // Sort: high first, then medium, then low
  const sorted = [...suggestions].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.type] || 2) - (order[b.type] || 2);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {sorted.map((suggestion, index) => {
        const config = SEVERITY_CONFIG[suggestion.type] || SEVERITY_CONFIG.low;
        const isExpanded = expandedIndex === index;
        const icon = ICON_MAP[suggestion.icon] || <Zap size={16} />;

        return (
          <motion.div
            key={`${suggestion.title}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
            style={{
              background: config.bg,
              borderRadius: '14px',
              border: `1px solid rgba(255,255,255,0.05)`,
              borderLeft: `4px solid ${config.borderColor}`,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isExpanded ? config.glow : 'none',
            }}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  color: config.badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '2px',
                  }}>
                    <span style={{
                      fontSize: '0.5rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: config.badgeBg,
                      color: config.badgeColor,
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {config.label}
                    </span>
                    {suggestion.power_savings > 0 && (
                      <span style={{
                        fontSize: '0.5rem',
                        fontWeight: 700,
                        color: 'var(--accent-neon)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.05em',
                      }}>
                        −{suggestion.power_savings}W
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {suggestion.title}
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Expandable Body */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    padding: '0 16px 16px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.65,
                        margin: '12px 0',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: suggestion.description
                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white; font-weight: 700;">$1</strong>')
                      }}
                    />

                    {/* Power + Carbon savings */}
                    {suggestion.power_savings > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)' }}>
                            {suggestion.power_savings}W
                          </div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                            POWER SAVINGS
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-neon)', fontFamily: 'var(--font-mono)' }}>
                            {suggestion.carbon_savings.toFixed(1)}g
                          </div>
                          <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                            CO₂/HR SAVED
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommended Action */}
                    <div style={{
                      marginTop: '12px',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{ color: config.badgeColor }}>▶</span>
                      {suggestion.action}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
