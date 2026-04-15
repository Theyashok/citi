import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box,
} from '@mui/material';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        className: "bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2"
      }}
    >
      <DialogTitle className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <Typography variant="h6" className="text-white font-black tracking-tight">{title ?? 'Confirm Action'}</Typography>
        </div>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" className="text-slate-400 font-medium leading-relaxed">
          {message ?? 'Are you sure? This action cannot be undone and may affect associated system data.'}
        </Typography>
      </DialogContent>
      <DialogActions className="px-6 pb-6 gap-3 pt-2">
        <Button 
          variant="text" 
          onClick={onCancel} 
          disabled={loading}
          className="text-slate-400 font-bold hover:text-white hover:bg-white/5 normal-case px-6"
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={onConfirm} 
          disabled={loading}
          startIcon={!loading && <Trash2 className="w-4 h-4" />}
          className="bg-red-600 hover:bg-red-700 rounded-xl px-8 py-2.5 font-bold shadow-lg shadow-red-600/20 normal-case"
        >
          {loading ? 'Processing...' : 'Confirm Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
