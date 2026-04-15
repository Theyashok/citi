import { Box, Typography, Button } from '@mui/material';
import { Inbox, LayoutPanelLeft } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  const LucideIcon = Icon ?? Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <LucideIcon className="w-10 h-10 opacity-50" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
          <LayoutPanelLeft className="w-4 h-4 text-brand-500" />
        </div>
      </div>
      
      <Typography variant="h6" className="text-white font-black tracking-tight mb-2">
        {title ?? 'Operational Data Void'}
      </Typography>
      <Typography className="text-slate-500 text-sm font-medium max-w-[340px] leading-relaxed mb-8">
        {message ?? 'Our systems indicate no records present in this sector. Synchronize new data or adjust your filters.'}
      </Typography>
      
      {actionLabel && onAction && (
        <Button 
          variant="contained" 
          onClick={onAction}
          className="bg-brand-500 hover:bg-brand-600 rounded-xl px-8 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
