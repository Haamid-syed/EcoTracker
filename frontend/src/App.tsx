import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import './index.css';
import LandingPage from './LandingPage';
import { DashboardUI } from './DashboardUI';
import Documentation from './Documentation';
import { Navbar, Footer } from './components/Navigation';

/**
 * Ensures page scroll is reset to top on navigation.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

/**
 * Main Layout wrapper to provide consistent navigation and footers.
 */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <LandingPage />
                </motion.div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
                  <DashboardUI />
                </motion.div>
              }
            />
            <Route
              path="/documentation"
              element={
                <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
                  <Documentation />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
