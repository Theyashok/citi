import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField, Button, Typography, Alert,
  MenuItem, CircularProgress,
} from '@mui/material';
import { 
  Users, 
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const ROLES = [
  { value: 'admin',       label: 'Administrator', desc: 'Full system management' },
  { value: 'manager',     label: 'Team Manager',  desc: 'Control teams & reports' },
  { value: 'contributor', label: 'Contributor',   desc: 'Data entry & insights' },
  { value: 'viewer',      label: 'Stakeholder',   desc: 'Read-only analytics' },
];

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'contributor' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.role);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      const detailMsg = data?.details?.[0]?.msg;
      setError(detailMsg || data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30">
      {/* Branding Panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-teal-600/20 blur-[100px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/25">
            <Users className="text-white w-10 h-10" />
          </div>
          <Typography variant="h2" className="text-white font-black tracking-tighter mb-4">
            Join the <span className="text-emerald-400">Network</span>
          </Typography>
          <Typography className="text-slate-400 text-lg max-w-md mx-auto mb-12 font-medium">
            Empower your team with data-driven leadership and real-time collaboration tools.
          </Typography>

          <div className="space-y-4 max-w-sm mx-auto">
            {[
              "Real-time organizational telemetry",
              "Advanced leadership alignment tools",
              "Automated achievement tracking",
              "Enterprise-grade security controls"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-300 text-left">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Empowering High-Performance Teams
        </div>
      </div>

      {/* Registration Form Side */}
      <div className="flex-[0.8] xl:flex-[0.6] flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-[400px] w-full relative z-10"
        >
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
            </Link>
            <Typography variant="h4" className="text-white font-black mb-2 tracking-tight">
              Create Profile
            </Typography>
            <Typography className="text-slate-400 font-medium ml-0.5">
              Begin your journey with TeamHub Enterprise.
            </Typography>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Alert severity="error" className="mb-6 bg-red-500/10 border border-red-500/20 text-red-100 rounded-xl">
                {error}
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <TextField
                fullWidth variant="outlined"
                placeholder="Manas Pant"
                value={form.name} onChange={set('name')}
                required autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <TextField
                fullWidth variant="outlined" type="email"
                placeholder="name@citi.com"
                value={form.email} onChange={set('email')}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                <TextField
                  fullWidth variant="outlined" type="password"
                  placeholder="••••••••"
                  value={form.password} onChange={set('password')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: '16px',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                    },
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">System Role</label>
                <TextField
                  fullWidth select
                  value={form.role} onChange={set('role')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: '16px',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' },
                    },
                    '& .MuiSelect-icon': { color: '#64748b' }
                  }}
                >
                  {ROLES.map(r => (
                    <MenuItem key={r.value} value={r.value} className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{r.label}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{r.desc}</span>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 leading-relaxed italic">
              * By registering, you agree to our Enterprise Terms of Service and Privacy Governance.
            </div>

            <Button
              fullWidth variant="contained" type="submit"
              disabled={loading}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-emerald-500/20"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <UserPlus className="w-4 h-4" />}
            >
              {loading ? 'Initializing...' : 'Confirm Registration'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <Typography className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Secured by TeamHub AI
            </Typography>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
