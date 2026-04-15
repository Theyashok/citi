import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { 
  Eye, 
  EyeOff, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/insights');
    } catch (err) {
      const data = err.response?.data;
      const detailMsg = data?.details?.[0]?.msg;
      setError(detailMsg || data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail('demo@citi.com');
    setPassword('demo-key-2026');
  };

  const handleForgot = () => {
    setError('Please contact your System Administrator for access key recovery.');
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-brand-500/30">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-slate-950">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full" />
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-brand-500/25">
            <Zap className="text-white w-10 h-10" />
          </div>
          <Typography variant="h2" className="text-white font-black tracking-tighter mb-4">
            Team<span className="text-brand-400">Hub</span> Intelligence
          </Typography>
          <Typography className="text-slate-400 text-lg max-w-md mx-auto mb-12 font-medium">
            Unlock deep organizational insights and streamline team performance with our enterprise-grade analytics engine.
          </Typography>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {[
              { icon: ShieldCheck, text: "Secure Auth" },
              { icon: Globe, text: "Global Sync" },
              { icon: BarChart3, text: "Real-time BI" },
              { icon: Zap, text: "Instant Metrics" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <feature.icon className="w-5 h-5 text-brand-400" />
                <span className="text-sm font-bold text-white tracking-wide">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Next-Generation Organizational Data
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-[0.8] xl:flex-[0.6] flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-[400px] w-full relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <Typography variant="h4" className="text-white font-black mb-2 tracking-tight">
              Welcome Back
            </Typography>
            <Typography className="text-slate-400 font-medium ml-0.5">
              Please enter your credentials to access the platform.
            </Typography>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Alert severity="error" className="mb-6 bg-red-500/10 border border-red-500/20 text-red-100 rounded-xl">
                {error}
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <TextField
                fullWidth variant="outlined" type="email"
                placeholder="name@citi.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus autoComplete="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
                }}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
              <TextField
                fullWidth variant="outlined"
                placeholder="••••••••"
                type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton className="text-slate-500 hover:text-white" onClick={() => setShowPw(v => !v)}>
                        {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                  },
                }}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                onClick={handleForgot}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Forgot access details?
              </button>
            </div>

            <Button
              fullWidth variant="contained" type="submit"
              disabled={loading}
              className="mt-4 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl shadow-brand-500/20"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Zap className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </Button>
            
            <div className="pt-2">
              <Button
                fullWidth
                variant="outlined"
                onClick={handleDemo}
                className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 py-3 rounded-2xl font-bold text-xs normal-case"
              >
                Use Demo Credentials
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <Typography className="text-slate-400 text-sm font-medium">
              New to TeamHub?{' '}
              <Link to="/register" className="text-white font-black hover:text-brand-400 transition-colors inline-flex items-center gap-1 group">
                Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Typography>
          </div>
        </motion.div>

        {/* Aesthetic footer */}
        <div className="absolute bottom-6 text-[10px] text-slate-700 font-bold uppercase tracking-widest">
          © 2026 TeamHub Enterprise v2.4.0
        </div>
      </div>
    </div>
  );
}
