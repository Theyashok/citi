import { useState, useCallback } from 'react';
import { Snackbar, Typography, Box } from '@mui/material';
import { 
  Wifi, 
  WifiOff, 
  Building2, 
  UserPlus, 
  UserMinus, 
  Trophy, 
  AlertCircle,
  Pencil,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import useSSE from '../hooks/useSSE';
import { motion, AnimatePresence } from 'framer-motion';

const EVENT_LABELS = {
  'team.created':        { label: 'New Organization Created', icon: Building2, color: 'emerald', sev: 'success' },
  'team.updated':        { label: 'Organization Reconfigured', icon: Pencil, color: 'brand', sev: 'info'    },
  'team.deleted':        { label: 'Organization Terminated',  icon: Trash2, color: 'red', sev: 'warning' },
  'member.created':      { label: 'Personnel Onboarded',      icon: UserPlus, color: 'emerald', sev: 'success' },
  'member.updated':      { label: 'Personnel Profile Sync',   icon: Pencil, color: 'brand', sev: 'info'    },
  'member.deleted':      { label: 'Personnel Offboarded',     icon: UserMinus, color: 'red', sev: 'warning' },
  'achievement.created': { label: 'Milestone Logged',        icon: Trophy, color: 'amber', sev: 'success' },
  'achievement.updated': { label: 'Milestone Recalibrated',   icon: Pencil, color: 'brand', sev: 'info'    },
  'achievement.deleted': { label: 'Milestone Purged',        icon: Trash2, color: 'red', sev: 'warning' },
};

export default function LiveNotifications({ onEvent }) {
  const [notification, setNotification] = useState(null);
  const [connected,    setConnected]    = useState(false);

  const handleMessage = useCallback((msg) => {
    if (msg.event === 'connected') {
      setConnected(true);
      return;
    }
    const meta = EVENT_LABELS[msg.event];
    if (!meta) return;
    const name = msg.data?.name || msg.data?.title || '';
    setNotification({ ...meta, name });
    onEvent?.(msg);
  }, [onEvent]);

  useSSE(handleMessage);

  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-500',
    brand:   'bg-brand-500/10 text-brand-500',
    red:     'bg-red-500/10 text-red-500',
    amber:   'bg-amber-500/10 text-amber-500',
  };

  return (
    <>
      {/* SSE connection status pill */}
      <Box sx={{ position: 'fixed', top: { xs: 80, sm: 84 }, right: 16, zIndex: 1300 }}>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -10 }}
          className={`px-3 py-1.5 rounded-full backdrop-blur-md border flex items-center gap-2 shadow-lg transition-colors ${
            connected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.1em]">
            {connected ? 'Sync: Active' : 'Sync: Lost'}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        </motion.div>
      </Box>

      {/* Event toast */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="mb-4 mr-4"
        disableWindowBlurListener
      >
        <AnimatePresence>
          {notification && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-4 min-w-[320px] max-w-[400px]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[notification.color] || colorMap.brand}`}>
                <notification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <Typography className="text-white font-bold text-sm tracking-tight mb-0.5">
                  {notification.label}
                </Typography>
                {notification.name && (
                  <Typography className="text-slate-400 text-xs truncate">
                    {notification.name}
                  </Typography>
                )}
              </div>
              <Box onClick={() => setNotification(null)} className="cursor-pointer hover:bg-white/5 rounded-lg p-1 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-slate-600 hover:text-white" />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Snackbar>
    </>
  );
}
