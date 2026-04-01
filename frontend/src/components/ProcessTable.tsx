import { motion } from 'framer-motion';

interface ProcessData {
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
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  browsers: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', label: 'BROWSER' },
  media: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a78bfa', label: 'MEDIA' },
  development: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'DEV' },
  communication: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', label: 'COMM' },
  creative: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', label: 'CREATIVE' },
  other: { bg: 'rgba(255, 255, 255, 0.05)', text: '#6b7280', label: 'SYS' },
};

/**
 * Micro sparkline SVG rendered inline per process row.
 */
const Sparkline = ({ data, color = 'var(--accent-neon)', width = 60, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) => {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * (height - 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
};

function formatIdleDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s idle`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m idle`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m idle`;
}

export const ProcessTable = ({ processes }: { processes: ProcessData[] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 70px 70px',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '0.55rem',
        fontWeight: 800,
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
      }}>
        <span>PROCESS</span>
        <span style={{ textAlign: 'right' }}>CPU</span>
        <span style={{ textAlign: 'right' }}>MEMORY</span>
        <span style={{ textAlign: 'center' }}>CPU TREND</span>
        <span style={{ textAlign: 'center' }}>MEM TREND</span>
      </div>

      {/* Process Rows */}
      {processes.map((proc, index) => {
        const cat = CATEGORY_COLORS[proc.category] || CATEGORY_COLORS.other;
        const cpuColor = proc.cpu > 20 ? 'var(--crit-color)' : proc.cpu > 8 ? 'var(--warn-color)' : 'var(--accent-neon)';
        
        return (
          <motion.div
            key={`${proc.pid}-${proc.name}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 120 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 70px 70px',
              gap: '8px',
              alignItems: 'center',
              padding: '14px 16px',
              background: proc.is_idle
                ? 'rgba(251, 191, 36, 0.03)'
                : 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: proc.is_idle
                ? '1px solid rgba(251, 191, 36, 0.15)'
                : '1px solid rgba(255,255,255,0.05)',
              borderLeft: proc.is_idle
                ? '4px solid var(--warn-color)'
                : proc.cpu > 15
                  ? '4px solid var(--crit-color)'
                  : '4px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Process Name + Category + Idle Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {proc.name}
                  <span style={{
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: cat.bg,
                    color: cat.text,
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}>
                    {cat.label}
                  </span>
                  {proc.is_idle && (
                    <span style={{
                      fontSize: '0.5rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(251, 191, 36, 0.12)',
                      color: '#fbbf24',
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      💤 {formatIdleDuration(proc.idle_duration)}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  marginTop: '2px',
                  letterSpacing: '0.03em',
                }}>
                  PID {proc.pid} // {proc.threads} threads
                </div>
              </div>
            </div>

            {/* CPU */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: cpuColor,
                fontFamily: 'var(--font-mono)',
              }}>
                {proc.cpu.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                avg {proc.avg_cpu.toFixed(1)}%
              </div>
            </div>

            {/* Memory */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: proc.memory > 10 ? 'var(--warn-color)' : 'white',
                fontFamily: 'var(--font-mono)',
              }}>
                {proc.memory_mb > 1024
                  ? `${(proc.memory_mb / 1024).toFixed(1)}G`
                  : `${proc.memory_mb.toFixed(0)}M`
                }
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {proc.memory.toFixed(1)}%
              </div>
            </div>

            {/* CPU Sparkline */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Sparkline data={proc.cpu_sparkline} color={cpuColor} />
            </div>

            {/* Memory Sparkline */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Sparkline data={proc.mem_sparkline} color={proc.memory > 10 ? 'var(--warn-color)' : 'rgba(46, 204, 113, 0.6)'} />
            </div>
          </motion.div>
        );
      })}

      {processes.length === 0 && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
        }}>
          No active processes detected
        </div>
      )}
    </div>
  );
};
