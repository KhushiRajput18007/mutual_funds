'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
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
      main: mode === 'dark' ? '#00d4ff' : '#2563eb',
      light: mode === 'dark' ? '#5dffff' : '#3b82f6',
      dark: mode === 'dark' ? '#00a3cc' : '#1d4ed8',
    },
    secondary: {
      main: mode === 'dark' ? '#ff6b35' : '#f59e0b',
      light: mode === 'dark' ? '#ff9d68' : '#fbbf24',
      dark: mode === 'dark' ? '#c73e00' : '#d97706',
    },
    background: {
      default: mode === 'dark' ? '#0a0e1a' : '#f8fafc',
      paper: mode === 'dark' ? '#1a1f2e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#1e293b',
      secondary: mode === 'dark' ? '#b0bec5' : '#64748b',
    },
    success: {
      main: mode === 'dark' ? '#00e676' : '#10b981',
    },
    error: {
      main: mode === 'dark' ? '#ff5252' : '#ef4444',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #2d3748 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(148, 163, 184, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: mode === 'dark'
            ? 'linear-gradient(45deg, #00d4ff 30%, #ff6b35 90%)'
            : 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
          borderRadius: 12,
          boxShadow: mode === 'dark'
            ? '0 4px 14px 0 rgba(0, 212, 255, 0.39)'
            : '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
        },
      },
    },
  },
});

export default function MUIThemeProvider({ children }) {
  const [mode, setMode] = useState('dark');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}