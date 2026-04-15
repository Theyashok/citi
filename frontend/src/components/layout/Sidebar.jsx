import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Trophy,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
  { label: 'Insights',      icon: LayoutDashboard,    path: '/app/insights'      },
  { label: 'Teams',         icon: Users,              path: '/app/teams'         },
  { label: 'Members',       icon: UserCircle,         path: '/app/members'       },
  { label: 'Achievements',  icon: Trophy,             path: '/app/achievements'  },
];

const ROLE_STYLES = {
  admin:       'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  manager:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  contributor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  viewer:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function SidebarContent({ onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const roleStyle = ROLE_STYLES[user?.role] ?? ROLE_STYLES.viewer;

  return (
    <Box className="flex flex-col h-full bg-[#020617] border-r border-white/5">
      {/* Brand Logo */}
      <Box className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Zap className="text-white w-5 h-5" />
        </div>
        <Typography variant="h6" className="font-extrabold tracking-tight text-white">
          Team<span className="text-brand-400">Hub</span>
        </Typography>
      </Box>

      {/* Navigation */}
      <Box className="flex-1 px-4 overflow-y-auto space-y-1">
        <div className="px-3 mb-2">
          <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Main Menu
          </Typography>
        </div>
        <List className="space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={path}
                  onClick={onClose}
                  className={`
                    rounded-xl px-4 py-3 transition-all duration-200 gap-3
                    ${active 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                  `}
                  sx={{ 
                    '&.Mui-selected': { backgroundColor: 'transparent' },
                    '&:hover': { backgroundColor: 'transparent' }
                  }}
                >
                  <ListItemIcon className="min-w-0">
                    <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-inherit'}`} />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ 
                      className: `text-sm font-semibold ${active ? 'text-brand-400' : 'text-inherit'}` 
                    }}
                  />
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400/50" />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Session Footer */}
      <div className="p-4 mx-4 mb-6 rounded-2xl bg-white/5 border border-white/5">
        <Box className="flex items-center gap-3">
          <Avatar 
            className="w-10 h-10 rounded-xl bg-brand-500 text-sm font-bold border-2 border-white/10"
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box className="flex-1 min-w-0">
            <Typography className="text-sm font-bold text-white truncate">
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              className={`
                h-5 text-[10px] font-bold border uppercase tracking-wider mt-1
                ${roleStyle}
              `}
            />
          </Box>
        </Box>
      </div>
    </Box>
  );
}

export default function Sidebar({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: DRAWER_WIDTH,
            border: 'none',
            backgroundColor: 'transparent'
          } 
        }}
      >
        <SidebarContent onClose={onClose} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: DRAWER_WIDTH, 
          position: 'fixed', 
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent'
        },
      }}
    >
      <SidebarContent onClose={() => {}} />
    </Drawer>
  );
}
