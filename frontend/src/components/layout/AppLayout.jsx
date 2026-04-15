import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import TopBar from './TopBar';
import LiveNotifications from '../LiveNotifications';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const location = useLocation();

  const handleEvent = useCallback(() => {
    setNotifCount(n => n + 1);
  }, []);

  return (
    <Box className="flex h-screen overflow-hidden bg-[#020617] text-slate-200">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse opacity-40" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[80px] rounded-full animate-pulse opacity-30" style={{ animationDelay: '4s' }} />
        
        {/* Animated Noise Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <Box
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10"
        sx={{ 
          ml: { md: `${DRAWER_WIDTH}px` },
          transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
        }}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(o => !o)}
          notifCount={notifCount}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 relative custom-scrollbar">
          <div className="max-w-7xl mx-auto relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                transition={{ 
                  duration: 0.45, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </Box>

      {/* Global live notifications */}
      <LiveNotifications
        onEvent={handleEvent}
      />
    </Box>
  );
}
