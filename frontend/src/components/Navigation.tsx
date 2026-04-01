import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Home, Activity } from 'lucide-react';

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
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-neon)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(46,204,113,0.4)' }}>
            <Activity size={18} color="black" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Eco-Tracker</span>
        </Link>

        <div className="nav-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <NavLink to="/" style={({ isActive }) => ({ ...navLinkStyle, color: isActive ? 'var(--accent-neon)' : 'var(--text-muted)' })}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/dashboard" style={({ isActive }) => ({ ...navLinkStyle, color: isActive ? 'var(--accent-neon)' : 'var(--text-muted)' })}>
            <LayoutDashboard size={16} /> Dashboard
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
  return (
    <footer style={{ 
      background: 'var(--bg-primary)', 
      borderTop: '1px solid rgba(46, 204, 113, 0.05)', 
      padding: '4rem 2rem 2rem', 
      marginTop: 'auto'
    }}>
      <div className="grid-footer" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div>
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Activity size={24} color="var(--accent-neon)" />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>Eco-Tracker</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>
            Real-time environmental telemetry and system hardware carbon impact tracking for the energy-conscious developer.
          </p>
        </div>
        
        <div>
          <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/dashboard" style={footerLinkStyle}>Telemetry Hub</Link></li>
            <li><Link to="/metrics" style={footerLinkStyle}>Global Metrics</Link></li>
            <li><Link to="/about" style={footerLinkStyle}>Carbon Methodology</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/" style={footerLinkStyle}>Privacy Console</Link></li>
            <li><Link to="/" style={footerLinkStyle}>Term Status</Link></li>
            <li><Link to="/" style={footerLinkStyle}>Security Root</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom-flex" style={{ maxWidth: '1400px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#4b5563', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>© 2026 ECO-TRACKER OS // v4.0.2</p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#4b5563', fontFamily: 'var(--font-mono)' }}>
          <span>LATENCY: 12ms</span>
          <span>REGION: GLOBAL-1</span>
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
