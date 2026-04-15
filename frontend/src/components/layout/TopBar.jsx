import { useState } from 'react';
import {
  IconButton, Typography, Box,
  Menu, MenuItem, Avatar, Divider, Badge, Tooltip,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Bell, 
  LogOut, 
  User,
  Search
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES = {
  '/app/insights':     'Insights Dashboard',
  '/app/teams':        'Teams Management',
  '/app/members':      'Member directory',
  '/app/achievements': 'Achievements & Milestone',
};

export default function TopBar({ onMenuClick, notifCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'TeamHub';

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex h-20 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <IconButton
            onClick={onMenuClick}
            className="md:hidden text-slate-400 hover:bg-white/5"
            size="small"
          >
            <MenuIcon className="w-5 h-5" />
          </IconButton>

          {/* Page title */}
          <div>
            <Typography className="text-xl font-bold text-white tracking-tight">
              {pageTitle}
            </Typography>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Typography className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                System Active
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar (aesthetic) */}
          <div className="hidden lg:flex items-center relative mr-2">
            <Search className="absolute left-3 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 w-64 transition-all"
            />
          </div>

          {/* Notification bell */}
          <Tooltip title="Recent events">
            <IconButton className="text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
              <Badge 
                badgeContent={notifCount || 0} 
                className="[&>.MuiBadge-badge]:bg-brand-500 [&>.MuiBadge-badge]:text-white [&>.MuiBadge-badge]:border-2 [&>.MuiBadge-badge]:border-[#020617]"
                max={9}
              >
                <Bell className="w-5 h-5" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User avatar menu */}
          <div className="h-8 w-px bg-white/10 mx-1" />

          <Tooltip title="Account Settings">
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="group flex items-center gap-2 pl-1 pr-1 py-1 rounded-full transition-all hover:bg-white/5"
            >
              <Avatar
                className="w-9 h-9 border-2 border-white/10 group-hover:border-brand-500/50 transition-colors bg-brand-500 text-sm font-bold"
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </Avatar>
              <div className="hidden md:block text-left mr-2">
                <Typography className="text-xs font-bold text-white leading-tight">
                  {user?.name?.split(' ')[0]}
                </Typography>
                <Typography className="text-[10px] text-slate-500 leading-tight">
                  {user?.role}
                </Typography>
              </div>
            </button>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ 
              className: "mt-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl min-w-[200px]"
            }}
          >
            <Box className="px-4 py-3">
              <Typography className="text-sm font-bold text-white">{user?.name}</Typography>
              <Typography className="text-xs text-slate-400">{user?.email}</Typography>
            </Box>
            <Divider className="border-white/5" />
            <MenuItem onClick={() => setAnchorEl(null)} className="gap-3 px-4 py-2 hover:bg-white/5 mx-2 my-1 rounded-xl group">
              <User className="w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
              <Typography className="text-sm text-slate-300 group-hover:text-white">Profile Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} className="gap-3 px-4 py-2 hover:bg-red-500/10 mx-2 my-1 rounded-xl group">
              <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
              <Typography className="text-sm text-red-400 group-hover:text-red-300">Logout Session</Typography>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
}
