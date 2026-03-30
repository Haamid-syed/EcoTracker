import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import LandingPage from './LandingPage';
import { DashboardUI } from './DashboardUI';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <LandingPage onEnter={() => setView('dashboard')} />
          </motion.div>
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <DashboardUI />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;

