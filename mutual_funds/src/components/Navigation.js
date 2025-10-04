'use client';

import { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, 
  Badge, Tooltip, Box, Chip
} from '@mui/material';
import { 
  Notifications, AccountCircle, TrendingUp, Compare, PieChart, 
  Search, DarkMode, LightMode
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Refresh notifications when user opens the dropdown
    if (notificationAnchor) {
      fetchNotifications();
    }
  }, [notificationAnchor]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (!mounted) {
    return (
      <AppBar position="fixed" sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(26, 31, 46, 0.9)' }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>MF Explorer</Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const navItems = [
    { label: 'Explore', path: '/funds', icon: <Search /> },
    { label: 'Compare', path: '/compare', icon: <Compare /> },
    { label: 'Portfolio', path: '/portfolio', icon: <PieChart /> },
    { label: 'Peer Analysis', path: '/peer-comparison', icon: <TrendingUp /> }
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(26, 31, 46, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component={Link} 
            href="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #00d4ff 30%, #ff6b35 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            MF Explorer
          </Typography>
          <Chip 
            label="Beta" 
            size="small" 
            color="secondary" 
            sx={{ ml: 1, fontSize: '0.7rem' }}
          />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              href={item.path}
              startIcon={item.icon}
              sx={{
                color: pathname === item.path ? 'primary.main' : 'text.primary',
                backgroundColor: pathname === item.path ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationClick}
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton 
              onClick={handleProfileClick}
              sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200
            }
          }}
        >
          <MenuItem onClick={() => { handleClose(); router.push('/profile'); }}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile Settings
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); toggleTheme(); }}>
            {mode === 'dark' ? <LightMode sx={{ mr: 2 }} /> : <DarkMode sx={{ mr: 2 }} />}
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={handleClose}>
            Sign Out
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 350,
              maxHeight: 400
            }
          }}
        >
          {notifications.map((notification, index) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationClose} 
              sx={{ borderBottom: index < notifications.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ 
                  bgcolor: notification.type === 'success' ? 'success.main' : 
                           notification.type === 'warning' ? 'warning.main' : 'info.main', 
                  mr: 2, 
                  width: 32, 
                  height: 32 
                }}>
                  {notification.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="primary.main">{notification.time}</Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
          {notifications.length === 0 && (
            <MenuItem onClick={handleNotificationClose}>
              <Box sx={{ textAlign: 'center', width: '100%', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}