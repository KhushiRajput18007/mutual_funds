'use client';

import { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, 
  Badge, Tooltip, Box, Chip, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Divider, useMediaQuery
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Notifications, AccountCircle, TrendingUp, Compare, PieChart, 
  Search, DarkMode, LightMode, BookmarkBorder, Menu as MenuIcon, Close
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Navigation() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch('/api/notifications', { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (_) {
      setNotifications([]);
    }
  };

  // Render identical structure on server and client to avoid hydration mismatches

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Explore', path: '/funds', icon: <Search /> },
    { label: 'Active Funds', path: '/active-funds', icon: <TrendingUp /> },
    { label: 'Trending', path: '/trending-funds', icon: <TrendingUp /> },
    { label: 'Compare', path: '/compare', icon: <Compare /> },
    { label: 'Watchlist', path: '/watchlist', icon: <BookmarkBorder /> },
    { label: 'Portfolio', path: '/portfolio', icon: <PieChart /> }
  ];

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'transparent',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: { xs: 64, md: 72 } }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp sx={{ mr: 1.5, color: 'primary.main', fontSize: '2rem' }} />
          </motion.div>
          <Typography 
            variant="h5" 
            component={Link} 
            href="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            MF Explorer
          </Typography>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Chip 
              label="Beta" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ 
                ml: 1.5, 
                fontSize: '0.7rem',
                fontWeight: 600,
                backdropFilter: 'blur(20px)',
                background: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.8)',
                border: (theme) => `1px solid ${theme.palette.primary.main}40`
              }}
            />
          </motion.div>
        </Box>

        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
          <motion.div
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              color="inherit"
              onClick={toggleMobileMenu}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)' 
                } 
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <Close /> : <MenuIcon />}
                </motion.div>
              </AnimatePresence>
            </IconButton>
          </motion.div>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={Link}
                href={item.path}
                startIcon={item.icon}
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'text.primary',
                  background: pathname === item.path 
                    ? (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(99, 102, 241, 0.1)'
                    : 'transparent',
                  backdropFilter: pathname === item.path ? 'blur(20px)' : 'none',
                  border: pathname === item.path 
                    ? (theme) => `1px solid ${theme.palette.primary.main}30`
                    : '1px solid transparent',
                  borderRadius: 3,
                  px: 2.5,
                  py: 1,
                  fontWeight: pathname === item.path ? 600 : 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                {item.label}
              </Button>
            </motion.div>
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
        
        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: {
              width: 280,
              background: muiTheme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              borderLeft: `1px solid ${muiTheme.palette.divider}`,
            }
          }}
          SlideProps={{
            direction: 'left'
          }}
        >
          <motion.div
            initial={{ x: 280 }}
            animate={{ x: 0 }}
            exit={{ x: 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Mobile Menu Header */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${muiTheme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.5rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  MF Explorer
                </Typography>
                <Chip 
                  label="Beta" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 'auto', fontSize: '0.7rem' }}
                />
              </Box>
              <IconButton
                onClick={handleMobileMenuClose}
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Mobile Navigation Items */}
            <List sx={{ px: 2, py: 1 }}>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    component={Link}
                    href={item.path}
                    onClick={handleMobileMenuClose}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: pathname === item.path 
                        ? 'rgba(99, 102, 241, 0.15)' 
                        : 'transparent',
                      border: pathname === item.path 
                        ? `1px solid ${muiTheme.palette.primary.main}30`
                        : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: muiTheme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateX(8px)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: pathname === item.path ? 'primary.main' : 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: pathname === item.path ? 600 : 500,
                          color: pathname === item.path ? 'primary.main' : 'inherit'
                        }
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>

            <Divider sx={{ mx: 2, my: 1 }} />

            {/* Mobile Menu Footer */}
            <Box sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Notifications
                </Typography>
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications fontSize="small" />
                </Badge>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Theme
                </Typography>
                <IconButton size="small" onClick={toggleTheme}>
                  {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>
              </Box>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleMobileMenuClose();
                    router.push('/profile');
                  }}
                  startIcon={<AccountCircle />}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Profile
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}