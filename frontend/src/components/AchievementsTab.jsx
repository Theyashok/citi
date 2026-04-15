import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Alert, MenuItem,
  Skeleton, Tooltip, Chip, Typography,
} from '@mui/material';
import { 
  Trophy, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  Plus, 
  ChevronRight,
  Target,
  Award,
  Filter
} from 'lucide-react';
import { achievementsAPI, teamsAPI } from '../services/api';
import usePermissions from '../hooks/usePermissions';
import ConfirmDialog from './common/ConfirmDialog';
import PageHeader from './common/PageHeader';
import { motion } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CY - 2 + i);
const EMPTY_FORM = { title: '', description: '', team_id: '', month: '', year: CY };

const MONTH_COLORS = {
  January: 'sky', February: 'indigo', March: 'rose', April: 'red',
  May: 'orange', June: 'green', July: 'emerald', August: 'cyan',
  September: 'blue', October: 'purple', November: 'pink', December: 'slate',
};

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState([]);
  const [teams, setTeams]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [open, setOpen]                 = useState(false);
  const [editing, setEditing]           = useState(null);
  const [search, setSearch]             = useState('');
  const [filterMonth, setFilterMonth]   = useState('');
  const [filterYear, setFilterYear]     = useState('');
  const [error, setError]               = useState('');
  const [saving, setSaving]             = useState(false);
  const [confirmId, setConfirmId]       = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const { canWrite, canDelete }         = usePermissions();
  const debouncedSearch = useDebounce(search, 400);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const res = await achievementsAPI.getAll(params);
      setAchievements(res.data.achievements || []);
    } catch { setError('Failed to fetch achievements'); }
    finally { setLoading(false); }
  };

  useEffect(() => { teamsAPI.getAll().then(r => setTeams(r.data.teams || [])); }, []);
  useEffect(() => { fetchAchievements(); }, [debouncedSearch, filterMonth, filterYear]);

  const openForm = (a = null) => {
    setEditing(a);
    setFormData(a ? { ...a } : EMPTY_FORM);
    setError('');
    setOpen(true);
  };
  const closeForm = () => { setOpen(false); setEditing(null); };
  const set = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Success"
        subtitle="Ledger — Document and celebrate key organizational milestones."
        icon={Trophy}
        count={achievements.length}
        action={canWrite && (
          <Button 
            variant="contained" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={() => openForm()}
            className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            Log Achievement
          </Button>
        )}
      />

      {/* Control bar */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search milestones..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <TextField 
            select 
            size="small" 
            label="Month" 
            value={filterMonth} 
            onChange={e => setFilterMonth(e.target.value)} 
            className="min-w-[140px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.875rem' },
              '& .MuiSelect-icon': { color: '#64748b' }
            }}
          >
            <MenuItem value="">All Periods</MenuItem>
            {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
          <TextField 
            select 
            size="small" 
            label="Year" 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)} 
            className="min-w-[110px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.875rem' },
              '& .MuiSelect-icon': { color: '#64748b' }
            }}
          >
            <MenuItem value="">All Years</MenuItem>
            {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="glass-card overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-white/[0.02]">
              <TableRow>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Accomplishment Title</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Driving Team</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Timeline</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Business Impact</TableCell>
                {(canWrite || canDelete) && <TableCell align="right" className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operations</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && achievements.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="55%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="45%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="35%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="75%" /></TableCell>
                      {(canWrite || canDelete) && <TableCell className="border-white/5" />}
                    </TableRow>
                  ))
                : achievements.map(a => (
                    <TableRow key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <Typography className="text-sm font-bold text-white tracking-tight">{a.title}</Typography>
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <Typography className="text-sm font-bold text-slate-300">
                          {teamMap[a.team_id] || <span className="text-slate-600 font-normal">Departmental</span>}
                        </Typography>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-${MONTH_COLORS[a.month] || 'slate'}-500/10 text-${MONTH_COLORS[a.month] || 'slate'}-400 border border-${MONTH_COLORS[a.month] || 'slate'}-500/10`}>
                          <Calendar className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{a.month} {a.year}</span>
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <Typography className="text-xs text-slate-400 max-w-[280px] truncate font-medium italic">
                          "{a.description || "Historical data migration pending."}"
                        </Typography>
                      </TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell align="right" className="border-white/5">
                          <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {canWrite && (
                              <Tooltip title="Rewrite History">
                                <IconButton size="small" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => openForm(a)}>
                                  <Edit3 className="w-4 h-4" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip title="Archive Record">
                                <IconButton size="small" className="text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmId(a.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && achievements.length === 0 && (
          <EmptyState 
            icon={Award} 
            title="Success Ledger Null" 
            message="No milestones recorded for the selected period. Start documenting team wins." 
            actionLabel={canWrite ? 'Register First Achievement' : undefined} 
            onAction={canWrite ? () => openForm() : undefined} 
          />
        )}
      </div>

      <Dialog 
        open={open} 
        onClose={closeForm} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ className: "bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl" }}
      >
        <DialogTitle className="text-white font-black tracking-tight text-xl pb-2">
          {editing ? 'Recalibrate Achievement Record' : 'Record Organizational Milestone'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          {error && <Alert severity="error" className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4" onClose={() => setError('')}>{error}</Alert>}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Achievement Title</label>
            <TextField fullWidth variant="outlined" placeholder="e.g. Q3 Performance Breakthrough" value={formData.title} onChange={set('title')} autoFocus sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Impact Narrative</label>
            <TextField fullWidth multiline rows={3} placeholder="Describe the strategic significance and team effort involved..." value={formData.description} onChange={set('description')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Attributed Department</label>
            <TextField fullWidth select value={formData.team_id} onChange={set('team_id')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}, '& .MuiSelect-icon': { color: '#64748b' }}}>
              {teams.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </TextField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Occurrence Month</label>
              <TextField fullWidth select value={formData.month} onChange={set('month')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}, '& .MuiSelect-icon': { color: '#64748b' }}}>
                {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fiscal Year</label>
              <TextField fullWidth select value={formData.year} onChange={e => setFormData(f => ({ ...f, year: parseInt(e.target.value) }))} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}, '& .MuiSelect-icon': { color: '#64748b' }}}>
                {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-6 gap-3">
          <Button onClick={closeForm} className="text-slate-400 font-bold hover:text-white hover:bg-white/5 normal-case px-6">
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              setSaving(true); setError('');
              try {
                editing ? await achievementsAPI.update(editing.id, formData) : await achievementsAPI.create(formData);
                closeForm(); fetchAchievements();
              } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
              finally { setSaving(false); }
            }} 
            variant="contained" 
            disabled={saving || !formData.title.trim() || !formData.team_id || !formData.month}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl px-8 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            {saving ? 'Recording...' : editing ? 'Sync Milestone' : 'Commit Achievement'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!confirmId} title="Confirm Erasure" message="This operational record will be permanently purged from the Success Ledger. This action cannot be reversed." loading={deleting} onConfirm={async () => {
        setDeleting(true);
        try { await achievementsAPI.delete(confirmId); fetchAchievements(); }
        catch { setError('Failed to delete achievement'); }
        finally { setDeleting(false); setConfirmId(null); }
      }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
