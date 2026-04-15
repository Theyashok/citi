import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, MenuItem,
  FormControlLabel, Checkbox, Skeleton, Tooltip, Chip, Typography, Avatar,
} from '@mui/material';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  User, 
  Star, 
  MapPin, 
  Mail,
  UserCheck,
  Building2,
  MoreVertical
} from 'lucide-react';
import { membersAPI, teamsAPI } from '../services/api';
import usePermissions from '../hooks/usePermissions';
import ConfirmDialog from './common/ConfirmDialog';
import EmptyState from './common/EmptyState';
import PageHeader from './common/PageHeader';
import { motion } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';

const EMPTY_FORM = { name: '', email: '', team_id: '', role: 'member', is_team_leader: false, is_direct_staff: true, location: '' };

export default function MembersTab() {
  const [members, setMembers]         = useState([]);
  const [teams, setTeams]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [open, setOpen]               = useState(false);
  const [editingMember, setEditing]   = useState(null);
  const [search, setSearch]           = useState('');
  const [filterTeam, setFilterTeam]   = useState('');
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);
  const [confirmId, setConfirmId]     = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const { canWrite, canDelete }       = usePermissions();
  const debouncedSearch = useDebounce(search, 400);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterTeam) params.team_id = filterTeam;
      const res = await membersAPI.getAll(params);
      setMembers(res.data.members || []);
    } catch { setError('Failed to fetch members'); }
    finally { setLoading(false); }
  };

  useEffect(() => { teamsAPI.getAll().then(r => setTeams(r.data.teams || [])); }, []);
  useEffect(() => { fetchMembers(); }, [debouncedSearch, filterTeam]);

  const openForm = (m = null) => {
    setEditing(m);
    setFormData(m ? { ...m } : EMPTY_FORM);
    setError('');
    setOpen(true);
  };
  const closeForm = () => { setOpen(false); setEditing(null); };
  const set = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));
  const setCheck = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.checked }));

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      editingMember ? await membersAPI.update(editingMember.id, formData) : await membersAPI.create(formData);
      closeForm(); fetchMembers();
    } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await membersAPI.delete(confirmId); fetchMembers(); }
    catch { setError('Failed to delete member'); }
    finally { setDeleting(false); setConfirmId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Workforce"
        subtitle="Directory — Manage personnel, roles, and departmental assignments."
        icon={User}
        count={members.length}
        action={canWrite && (
          <Button 
            variant="contained" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={() => openForm()}
            className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            Onboard Member
          </Button>
        )}
      />

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by name, email, or role..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <TextField 
            select 
            size="small"
            value={filterTeam} 
            onChange={e => setFilterTeam(e.target.value)} 
            className="min-w-[180px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              },
              '& .MuiSelect-icon': { color: '#64748b' }
            }}
          >
            <MenuItem value="">All Organizations</MenuItem>
            {teams.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
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
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Professional Identity</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Assignment</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Functional Status</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Workbase</TableCell>
                {(canWrite || canDelete) && <TableCell align="right" className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operations</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && members.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="70%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="50%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="40%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="30%" /></TableCell>
                      {(canWrite || canDelete) && <TableCell className="border-white/5" />}
                    </TableRow>
                  ))
                : members.map(m => (
                    <TableRow key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="border-white/5">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            className="w-10 h-10 rounded-xl bg-brand-500 text-sm font-bold border border-white/10 group-hover:scale-110 transition-transform"
                          >
                            {m.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <div className="flex flex-col">
                            <Typography className="text-sm font-bold text-white tracking-tight">{m.name}</Typography>
                            <Typography className="text-[11px] text-slate-500 flex items-center gap-1 font-medium italic">
                              <Mail className="w-3 h-3" /> {m.email}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <div className="flex flex-col">
                          <Typography className="text-xs font-bold text-slate-300">
                            {teamMap[m.team_id] || <span className="text-slate-600 font-normal">Unassigned</span>}
                          </Typography>
                          <Typography className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                            {m.role || "Member"}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <div className="flex flex-wrap gap-1.5">
                          {m.is_team_leader && (
                            <Chip 
                              icon={<Star className="w-3 h-3 text-amber-400 !ml-1" />} 
                              label="Lead" 
                              className="h-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider" 
                            />
                          )}
                          <Chip 
                            label={m.is_direct_staff ? 'Direct' : 'Support'} 
                            className={`h-5 text-[10px] font-bold uppercase tracking-wider ${m.is_direct_staff ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{m.location || "Remote"}</span>
                        </div>
                      </TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell align="right" className="border-white/5">
                          <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {canWrite && (
                              <Tooltip title="Configure Personnel">
                                <IconButton size="small" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => openForm(m)}>
                                  <Edit3 className="w-4 h-4" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip title="Offboard Member">
                                <IconButton size="small" className="text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmId(m.id)}>
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
        {!loading && members.length === 0 && (
          <EmptyState 
            icon={User} 
            title="Personnel Record Lost" 
            message="No system users match your current directory filter or search parameters." 
            actionLabel={canWrite ? 'Register New Personnel' : undefined} 
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
          {editingMember ? 'Personnel Profile Reconfiguration' : 'New Personnel Onboarding'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          {error && <Alert severity="error" className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4" onClose={() => setError('')}>{error}</Alert>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
              <TextField fullWidth variant="outlined" placeholder="e.g. Erika Muster" value={formData.name} onChange={set('name')} autoFocus sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Enterprise Email</label>
              <TextField fullWidth variant="outlined" type="email" placeholder="name@company.com" value={formData.email} onChange={set('email')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Organizational Unit</label>
              <TextField fullWidth select value={formData.team_id} onChange={set('team_id')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}, '& .MuiSelect-icon': { color: '#64748b' }}}>
                <MenuItem value="">Unassigned</MenuItem>
                {teams.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Functional Designation</label>
              <TextField fullWidth placeholder="e.g. Lead Analyst" value={formData.role} onChange={set('role')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Workbase</label>
            <TextField fullWidth placeholder="e.g. Berlin Office" value={formData.location} onChange={set('location')} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&.Mui-focused fieldset': { borderColor: '#0ea5e9' }}}} />
          </div>

          <div className="flex gap-6 pt-2">
            <FormControlLabel 
              control={<Checkbox checked={formData.is_team_leader} onChange={setCheck('is_team_leader')} sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: '#10b981' }}} />} 
              label={<span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Departmental Lead</span>} 
            />
            <FormControlLabel 
              control={<Checkbox checked={formData.is_direct_staff} onChange={setCheck('is_direct_staff')} sx={{ color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: '#10b981' }}} />} 
              label={<span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Direct Reporting</span>} 
            />
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-6 gap-3">
          <Button onClick={closeForm} disabled={saving} className="text-slate-400 font-bold hover:text-white hover:bg-white/5 normal-case px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={saving || !formData.name.trim() || !formData.email.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl px-8 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            {saving ? 'Processing...' : editingMember ? 'Sync Profile' : 'Confirm Onboarding'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={!!confirmId} title="Confirm Offboarding" message="This action will permanently revoke system access for this member and purge their profile data from the organizational database." loading={deleting} onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
    </div>
  );
}
