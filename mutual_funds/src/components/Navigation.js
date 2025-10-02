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

export default function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { label: 'Portfolio', path: '/portfolio', icon: <PieChart /> }
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
              <Badge badgeContent={3} color="error">
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
          <MenuItem onClick={handleClose}>
            <AccountCircle sx={{ mr: 2 }} />
            Profile Settings
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <DarkMode sx={{ mr: 2 }} />
            Dark Mode
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
          {/* Market Alerts */}
          <MenuItem onClick={handleNotificationClose} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 32, height: 32 }}>📈</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">NIFTY 50 Surge</Typography>
                <Typography variant="body2" color="text.secondary">
                  Index up 2.8% - Best performing sectors: IT, Banking
                </Typography>
                <Typography variant="caption" color="primary.main">2 mins ago</Typography>
              </Box>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleNotificationClose} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 32, height: 32 }}>⚠️</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Volatility Alert</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mid-cap funds showing high volatility - Consider rebalancing
                </Typography>
                <Typography variant="caption" color="primary.main">15 mins ago</Typography>
              </Box>
            </Box>
          </MenuItem>

          <MenuItem onClick={handleNotificationClose} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 32, height: 32 }}>💰</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">SIP Opportunity</Typography>
                <Typography variant="body2" color="text.secondary">
                  Large-cap funds at attractive valuations for SIP entry
                </Typography>
                <Typography variant="caption" color="primary.main">1 hour ago</Typography>
              </Box>
            </Box>
          </MenuItem>

          {/* Portfolio Updates */}
          <MenuItem onClick={handleNotificationClose} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 32, height: 32 }}>📊</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Portfolio Gain</Typography>
                <Typography variant="body2" color="text.secondary">
                  Your portfolio gained ₹8,450 today (+1.2%)
                </Typography>
                <Typography variant="caption" color="primary.main">Today</Typography>
              </Box>
            </Box>
          </MenuItem>

          <MenuItem onClick={handleNotificationClose} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 32, height: 32 }}>🎯</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Goal Achievement</Typography>
                <Typography variant="body2" color="text.secondary">
                  Retirement fund is 68% complete - On track!
                </Typography>
                <Typography variant="caption" color="primary.main">Yesterday</Typography>
              </Box>
            </Box>
          </MenuItem>

          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 32, height: 32 }}>🔔</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">Rebalancing Alert</Typography>
                <Typography variant="body2" color="text.secondary">
                  Equity allocation at 78% - Consider rebalancing
                </Typography>
                <Typography variant="caption" color="primary.main">2 days ago</Typography>
              </Box>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}