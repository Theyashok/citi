import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Alert, Skeleton,
  Tooltip, Chip, Typography,
} from '@mui/material';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin, 
  Info,
  ChevronRight
} from 'lucide-react';
import { teamsAPI } from '../services/api';
import usePermissions from '../hooks/usePermissions';
import ConfirmDialog from './common/ConfirmDialog';
import EmptyState from './common/EmptyState';
import PageHeader from './common/PageHeader';
import { motion } from 'framer-motion';
import useDebounce from '../hooks/useDebounce';

const EMPTY_FORM = { name: '', location: '', organization_leader_id: '', description: '' };

export default function TeamsTab() {
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [search, setSearch]         = useState('');
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [confirmId, setConfirmId]   = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const { canWrite, canDelete }     = usePermissions();
  const debouncedSearch = useDebounce(search, 400);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamsAPI.getAll({ search });
      setTeams(res.data.teams || []);
    } catch { setError('Failed to fetch teams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, [debouncedSearch]);

  const openForm = (team = null) => {
    setEditingTeam(team);
    setFormData(team ? { ...team } : EMPTY_FORM);
    setError('');
    setOpen(true);
  };

  const closeForm = () => { setOpen(false); setEditingTeam(null); };

  const set = (k) => (e) => setFormData(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      editingTeam ? await teamsAPI.update(editingTeam.id, formData) : await teamsAPI.create(formData);
      closeForm();
      fetchTeams();
    } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await teamsAPI.delete(confirmId); fetchTeams(); }
    catch { setError('Failed to delete team'); }
    finally { setDeleting(false); setConfirmId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Teams"
        subtitle="Directory — Manage organizational structure and team definitions."
        icon={Users}
        count={teams.length}
        action={canWrite && (
          <Button 
            variant="contained" 
            startIcon={<Plus className="w-4 h-4" />} 
            onClick={() => openForm()}
            className="bg-brand-500 hover:bg-brand-600 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            Create New Team
          </Button>
        )}
      />

      {/* Control bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search teams..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-brand-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updating...</span>
          </div>
        )}
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
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Team Identity</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Base Location</TableCell>
                <TableCell className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Business Context</TableCell>
                {(canWrite || canDelete) && <TableCell align="right" className="border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Operations</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && teams.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="60%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="40%" /></TableCell>
                      <TableCell className="border-white/5"><Skeleton className="bg-white/5" width="80%" /></TableCell>
                      {(canWrite || canDelete) && <TableCell className="border-white/5" />}
                    </TableRow>
                  ))
                : teams.map(team => (
                    <TableRow key={team.id} className="hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-4 h-4" />
                          </div>
                          <Typography className="text-sm font-bold text-white tracking-tight">{team.name}</Typography>
                        </div>
                      </TableCell>
                      <TableCell className="border-white/5">
                        {team.location ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{team.location}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">No location set</span>
                        )}
                      </TableCell>
                      <TableCell className="border-white/5">
                        <Typography className="text-xs text-slate-400 max-w-[300px] truncate font-medium">
                          {team.description || "No description provided."}
                        </Typography>
                      </TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell align="right" className="border-white/5">
                          <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {canWrite && (
                              <Tooltip title="Modify Configuration">
                                <IconButton size="small" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => openForm(team)}>
                                  <Edit3 className="w-4 h-4" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canDelete && (
                              <Tooltip title="Decommission Team">
                                <IconButton size="small" className="text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmId(team.id)}>
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
        {!loading && teams.length === 0 && (
          <EmptyState
            icon={Users}
            title="Team Database Empty"
            message="There are no teams matching your criteria. Create one to start assigning members."
            actionLabel={canWrite ? 'Register First Team' : undefined}
            onAction={canWrite ? () => openForm() : undefined}
          />
        )}
      </div>

      {/* Form dialog */}
      <Dialog 
        open={open} 
        onClose={closeForm} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ className: "bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl" }}
      >
        <DialogTitle className="text-white font-black tracking-tight text-xl pb-2">
          {editingTeam ? 'Modify Team Configuration' : 'Register New Team'}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          {error && <Alert severity="error" className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4" onClose={() => setError('')}>{error}</Alert>}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Team Identity Name</label>
            <TextField 
              fullWidth 
              variant="outlined"
              placeholder="e.g. Core Engineering"
              value={formData.name} 
              onChange={set('name')} 
              autoFocus 
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                },
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Base Location</label>
              <TextField 
                fullWidth 
                placeholder="e.g. London"
                value={formData.location} 
                onChange={set('location')} 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                  },
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Org Leader ID</label>
              <TextField 
                fullWidth 
                placeholder="e.g. M-1049"
                value={formData.organization_leader_id} 
                onChange={set('organization_leader_id')} 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                  },
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Business Context & Purpose</label>
            <TextField 
              fullWidth 
              multiline 
              rows={3} 
              placeholder="Describe the team's primary objectives..."
              value={formData.description} 
              onChange={set('description')} 
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#0ea5e9' },
                },
              }}
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
            disabled={saving || !formData.name.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl px-8 py-2.5 font-bold shadow-lg shadow-brand-500/20 normal-case"
          >
            {saving ? 'Processing...' : editingTeam ? 'Sync Changes' : 'Initialize Team'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        title="Confirm Decommission"
        message="This operation will permanently purge the team configuration. Member assignments will be reset. Proceed with caution."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
