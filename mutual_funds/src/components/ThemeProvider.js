'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6366f1' : '#6366f1',
      light: mode === 'dark' ? '#8b5cf6' : '#8b5cf6',
      dark: mode === 'dark' ? '#4338ca' : '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#ec4899' : '#ec4899',
      light: mode === 'dark' ? '#f472b6' : '#f472b6',
      dark: mode === 'dark' ? '#be185d' : '#be185d',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: mode === 'dark' ? '#06b6d4' : '#06b6d4',
      light: mode === 'dark' ? '#22d3ee' : '#22d3ee',
      dark: mode === 'dark' ? '#0891b2' : '#0891b2',
    },
    background: {
      default: mode === 'dark' 
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      paper: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      surface: mode === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(248, 250, 252, 0.8)',
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
      secondary: mode === 'dark' ? '#cbd5e1' : '#475569',
      disabled: mode === 'dark' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    success: {
      main: mode === 'dark' ? '#22c55e' : '#16a34a',
      light: mode === 'dark' ? '#4ade80' : '#22c55e',
      dark: mode === 'dark' ? '#15803d' : '#14532d',
    },
    warning: {
      main: mode === 'dark' ? '#f59e0b' : '#d97706',
      light: mode === 'dark' ? '#fbbf24' : '#f59e0b',
      dark: mode === 'dark' ? '#d97706' : '#a16207',
    },
    error: {
      main: mode === 'dark' ? '#ef4444' : '#dc2626',
      light: mode === 'dark' ? '#f87171' : '#ef4444',
      dark: mode === 'dark' ? '#dc2626' : '#b91c1c',
    },
    info: {
      main: mode === 'dark' ? '#3b82f6' : '#2563eb',
      light: mode === 'dark' ? '#60a5fa' : '#3b82f6',
      dark: mode === 'dark' ? '#2563eb' : '#1d4ed8',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'",
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.05em',
    },
    h2: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.7,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.025em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          },
        },
        body: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(150%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15)'
            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0 12px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
              : '0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(150%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.025em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 8px 25px 0 rgba(99, 102, 241, 0.5), 0 4px 10px 0 rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          background: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(0, 0, 0, 0.15)',
          '&:hover': {
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.9)',
            borderColor: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(0, 0, 0, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        text: {
          '&:hover': {
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              border: mode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        outlined: {
          background: mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark' 
            ? 'rgba(15, 15, 35, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: mode === 'dark'
            ? '0 4px 32px rgba(0, 0, 0, 0.3)'
            : '0 4px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.04)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
  },
});

export default function MUIThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = createAppTheme(mode);

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
}