import { Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Reusable page header.
 */
export default function PageHeader({ title, subtitle, count, action, icon: Icon }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-2">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Icon size={20} />
            </div>
          )}
          <Typography variant="h4" className="text-white font-black tracking-tight flex items-center gap-3">
            {title}
            {count !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold">
                {count}
              </span>
            )}
          </Typography>
        </div>
        {subtitle && (
          <Typography className="text-slate-500 font-medium text-sm ml-0.5">
            {subtitle}
          </Typography>
        )}
      </motion.div>
      
      {action && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-shrink-0"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
