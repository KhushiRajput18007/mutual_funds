'use client';

import { useState, useEffect } from 'react';
import { Box, Fab, Tooltip, IconButton, Snackbar, Alert } from '@mui/material';
import { 
  KeyboardArrowUp, 
  AccessibilityNew, 
  TextIncrease, 
  TextDecrease,
  Contrast,
  VolumeUp
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Scroll to Top Button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <Tooltip title="Scroll to top" placement="left">
            <Fab
              color="primary"
              size="medium"
              onClick={scrollToTop}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5856eb, #7c3aed)',
                  transform: 'scale(1.1)'
                },
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Accessibility Panel
export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [notifications, setNotifications] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Load saved accessibility preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      document.documentElement.style.fontSize = `${size}px`;
    }
    
    if (savedHighContrast === 'true') {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
  }, []);

  const increaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
      localStorage.setItem('accessibility-font-size', newSize.toString());
      setNotifications({
        open: true,
        message: 'Font size increased',
        severity: 'success'
      });
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2;
      setFontSize(newSize);
      document.documentElement.style.fontSize = `${newSize}px`;
      localStorage.setItem('accessibility-font-size', newSize.toString());
      setNotifications({
        open: true,
        message: 'Font size decreased',
        severity: 'success'
      });
    }
  };

  const resetFontSize = () => {
    setFontSize(16);
    document.documentElement.style.fontSize = '16px';
    localStorage.setItem('accessibility-font-size', '16');
    setNotifications({
      open: true,
      message: 'Font size reset to default',
      severity: 'info'
    });
  };

  const toggleHighContrast = () => {
    const newHighContrast = !highContrast;
    setHighContrast(newHighContrast);
    
    if (newHighContrast) {
      document.body.classList.add('high-contrast');
      localStorage.setItem('accessibility-high-contrast', 'true');
      setNotifications({
        open: true,
        message: 'High contrast mode enabled',
        severity: 'success'
      });
    } else {
      document.body.classList.remove('high-contrast');
      localStorage.setItem('accessibility-high-contrast', 'false');
      setNotifications({
        open: true,
        message: 'High contrast mode disabled',
        severity: 'info'
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 1000
        }}
      >
        {/* Main Accessibility Button */}
        <Tooltip title="Accessibility Options" placement="right">
          <Fab
            size="medium"
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669, #047857)',
                transform: 'scale(1.1)'
              },
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              mb: 1
            }}
          >
            <AccessibilityNew />
          </Fab>
        </Tooltip>

        {/* Accessibility Controls */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  p: 2,
                  mb: 1,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  minWidth: 200
                }}
              >
                {/* Font Size Controls */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Tooltip title="Decrease font size">
                      <IconButton 
                        size="small" 
                        onClick={decreaseFontSize}
                        disabled={fontSize <= 12}
                        sx={{ 
                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                        }}
                      >
                        <TextDecrease fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Box 
                      sx={{ 
                        px: 2, 
                        py: 0.5, 
                        bgcolor: 'rgba(148, 163, 184, 0.1)', 
                        borderRadius: 1,
                        minWidth: 60,
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      {fontSize}px
                    </Box>
                    
                    <Tooltip title="Increase font size">
                      <IconButton 
                        size="small" 
                        onClick={increaseFontSize}
                        disabled={fontSize >= 24}
                        sx={{ 
                          bgcolor: 'rgba(99, 102, 241, 0.1)',
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                        }}
                      >
                        <TextIncrease fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFontSize}
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '6px',
                      background: 'transparent',
                      color: '#6366f1',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Reset Font Size
                  </motion.button>
                </Box>

                {/* High Contrast Toggle */}
                <Box sx={{ mb: 2 }}>
                  <Tooltip title="Toggle high contrast mode">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleHighContrast}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '0.9rem',
                        border: highContrast ? '2px solid #10b981' : '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '8px',
                        background: highContrast ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: highContrast ? '#10b981' : '#374151',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Contrast fontSize="small" />
                      {highContrast ? 'High Contrast ON' : 'High Contrast OFF'}
                    </motion.button>
                  </Tooltip>
                </Box>

                {/* Screen Reader Info */}
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'rgba(59, 130, 246, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VolumeUp fontSize="small" sx={{ color: '#3b82f6' }} />
                    <Box sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6' }}>
                      Screen Reader
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>
                    This site is compatible with screen readers and includes proper ARIA labels.
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Notifications */}
      <Snackbar
        open={notifications.open}
        autoHideDuration={3000}
        onClose={() => setNotifications({ ...notifications, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={notifications.severity}
          onClose={() => setNotifications({ ...notifications, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {notifications.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// Focus Management Hook
export function useFocusManagement() {
  useEffect(() => {
    // Skip link functionality
    const skipLink = document.querySelector('a[href="#main-content"]');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Keyboard navigation enhancement
    const handleKeyDown = (e) => {
      // Alt + M for main menu
      if (e.altKey && e.key.toLowerCase() === 'm') {
        const navigation = document.querySelector('nav');
        if (navigation) {
          navigation.focus();
        }
      }
      
      // Alt + S for search
      if (e.altKey && e.key.toLowerCase() === 's') {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

// Responsive Breakpoint Hook
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setBreakpoint('xs');
      } else if (width < 900) {
        setBreakpoint('sm');
      } else if (width < 1200) {
        setBreakpoint('md');
      } else if (width < 1536) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl'
  };
}