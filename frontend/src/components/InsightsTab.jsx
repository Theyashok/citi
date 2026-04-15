import { useState, useEffect, useCallback } from 'react';
import {
  Grid, Typography, Skeleton,
  Alert, Button, Chip,
} from '@mui/material';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  MapPinOff, 
  Briefcase, 
  TrendingUp, 
  Network,
  RefreshCw,
  Signal
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { insightsAPI } from '../services/api';
import useSSE from '../hooks/useSSE';

const METRICS = [
  { key: 'total_teams',                     label: 'Total Teams',                icon: Users,          color: '#6366f1', bg: 'bg-indigo-500/10' },
  { key: 'total_members',                   label: 'Total Members',              icon: UserPlus,       color: '#10b981', bg: 'bg-emerald-500/10' },
  { key: 'teams_with_leader_not_colocated', label: 'Leader Not Co-located',      icon: MapPinOff,      color: '#f59e0b', bg: 'bg-amber-500/10' },
  { key: 'teams_with_nondir_leader',        label: 'Non-direct Leader',          icon: Briefcase,      color: '#8b5cf6', bg: 'bg-violet-500/10' },
  { key: 'teams_nondir_ratio_above_20',     label: 'Non-direct Ratio >20%',      icon: TrendingUp,     color: '#ef4444', bg: 'bg-red-500/10' },
  { key: 'teams_reporting_to_org_leader',   label: 'Report to Org Leader',       icon: Network,        color: '#06b6d4', bg: 'bg-cyan-500/10' },
];

const PIE_COLORS = ['#6366f1', '#ef4444'];

function MetricCard({ metric, value, loading, index }) {
  const { label, icon: Icon, color, bg } = metric;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 h-full flex flex-col justify-between group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bg} text-white transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
            <TrendingUp className="w-3 h-3" />
            Active
          </div>
        )}
      </div>

      <div>
        <Typography className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} className="bg-white/5" />
        ) : (
          <Typography className="text-3xl font-black text-white tracking-tighter">
            {value ?? '—'}
          </Typography>
        )}
      </div>
    </motion.div>
  );
}

export default function InsightsTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [live, setLive]       = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await insightsAPI.get();
      setData(res.data);
    } catch { setError('Failed to load insights data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const handleSSE = useCallback((msg) => {
    if (msg.event === 'connected') { setLive(true); return; }
    const refresh = ['member.created','member.updated','member.deleted','team.created','team.updated','team.deleted','achievement.created','achievement.deleted'];
    if (refresh.includes(msg.event)) fetchInsights();
  }, [fetchInsights]);

  useSSE(handleSSE);

  const barData = METRICS.map(m => ({
    name: m.label.split(' ').slice(0, 2).join(' '),
    value: data?.[m.key] ?? 0,
    color: m.color,
  }));

  const directCount = (data?.total_members ?? 0) - (data?.teams_with_nondir_leader ?? 0);
  const pieData = [
    { name: 'Direct Staff', value: Math.max(0, directCount) },
    { name: 'Non-direct',   value: data?.teams_with_nondir_leader ?? 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Typography variant="h4" className="text-white font-black tracking-tight">
              Organizational <span className="text-brand-400">Intelligence</span>
            </Typography>
            <div className={`
              flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest
              ${live ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}
            `}>
              <Signal className={`w-3 h-3 ${live ? 'animate-pulse' : ''}`} />
              {live ? 'Real-time Feed' : 'Connecting Data...'}
            </div>
          </div>
          <Typography className="text-slate-400 max-w-2xl font-medium">
            Monitor real-time organizational health metrics. Our system analyzes leadership alignment, staff composition, and achievement velocity.
          </Typography>
        </div>
        <Button 
          startIcon={<RefreshCw className="w-4 h-4" />} 
          onClick={fetchInsights} 
          variant="contained" 
          className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-brand-500/20"
          disabled={loading}
        >
          Resync Data
        </Button>
      </div>

      {error && (
        <Alert 
          severity="error" 
          className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl" 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Metric cards grid */}
      <Grid container spacing={3}>
        {METRICS.map((m, idx) => (
          <Grid item xs={12} sm={6} md={4} key={m.key}>
            <MetricCard metric={m} value={data?.[m.key]} loading={loading} index={idx} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar chart - Metric Overview */}
        <div className="lg:col-span-8 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography className="text-lg font-bold text-white tracking-tight">Metric Velocity</Typography>
            <Typography className="text-xs font-medium text-slate-500 uppercase tracking-widest">Global Distribution</Typography>
          </div>
          <div className="h-[280px] w-full">
            {loading ? (
              <Skeleton variant="rectangular" height="100%" className="bg-white/5 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                  />
                  <RTooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' 
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart - Staff Composition */}
        <div className="lg:col-span-4 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography className="text-lg font-bold text-white tracking-tight">Staffing Split</Typography>
            <Chip label="2024" size="small" className="bg-white/5 text-slate-400 text-[10px] h-5 font-bold" />
          </div>
          <div className="h-[280px] w-full flex flex-col items-center justify-center">
            {loading ? (
              <Skeleton variant="circular" width={180} height={180} className="bg-white/5" />
            ) : (data?.total_members > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      paddingAngle={8} 
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} fillOpacity={0.9} />)}
                    </Pie>
                    <Legend 
                      iconType="circle" 
                      verticalAlign="bottom"
                      formatter={(v) => <span className="text-xs font-semibold text-slate-400 ml-1">{v}</span>} 
                    />
                    <RTooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.1)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center">
                  <Typography className="text-slate-500 text-sm font-medium">No workforce data available</Typography>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
