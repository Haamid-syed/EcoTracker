import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Home, BookOpen } from 'lucide-react';

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 8, 7, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
        padding: '0.75rem 2rem'
      }}
    >
      <div className="nav-wrapper">
        <Link
          to="/"
          onClick={() => window.scrollTo(0, 0)}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.svg" alt="Carbonly Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Carbonly</span>
        </Link>

        <div className="nav-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <NavLink to="/" style={({ isActive }) => ({ ...navLinkStyle, color: isActive ? 'var(--accent-neon)' : 'var(--text-muted)' })}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/dashboard" style={({ isActive }) => ({ ...navLinkStyle, color: isActive ? 'var(--accent-neon)' : 'var(--text-muted)' })}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/documentation" style={({ isActive }) => ({ ...navLinkStyle, color: isActive ? 'var(--accent-neon)' : 'var(--text-muted)' })}>
            <BookOpen size={16} /> Docs
          </NavLink>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

          <div style={{ fontSize: '0.6rem', color: 'var(--text-telemetry)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            SYSTEM: OK // 0.1MS
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export const Footer = () => {
  const socialLinkStyle = { ...footerLinkStyle, display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid rgba(46, 204, 113, 0.05)',
      padding: '4rem 2rem 2rem',
      marginTop: 'auto'
    }}>
      <div className="grid-footer" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem' }}>
        {/* Project Info - Left Aligned */}
        <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="footer-logo"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', textDecoration: 'none' }}
          >
            <img src="/logo.svg" alt="Carbonly Logo" style={{ width: '32px', height: '32px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Carbonly</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '350px', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            Next-generation environmental telemetry and system hardware carbon impact tracking for modern developers.
          </p>
        </div>

        {/* Links - Centered */}
        <div style={{ flex: '2 1 400px', display: 'flex', gap: '6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><Link to="/dashboard" style={footerLinkStyle}>Dashboard</Link></li>
              <li><Link to="/documentation" style={footerLinkStyle}>Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.8 }}>Social</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><a href="https://github.com/Haamid-syed/EcoTracker" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>GitHub</a></li>
              <li><a href="https://x.com/Haamid_syedd" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>Twitter</a></li>
            </ul>
          </div>
        </div>
        <div style={{ flex: '1 1 300px' }} />
      </div>

      <div className="footer-bottom-flex" style={{ maxWidth: '1400px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#4b5563', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>© 2026 CARBONLY OS</p>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#4b5563', fontFamily: 'var(--font-mono)' }}>
          <span>LATENCY: 12ms</span>
          <span>REGION: GLOBAL-1</span>
          <span>STATUS: OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: 600,
  transition: 'color 0.2s ease'
};

const footerLinkStyle = {
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  transition: 'color 0.2s ease'
};
