'use client';

import { useState, useEffect, use } from 'react';
import {
  Typography, Box, Card, CardContent, Grid, Chip, CircularProgress,
  Container, Paper, Stack, Fade, IconButton, Tooltip, Button,
  LinearProgress, Divider, Avatar, CardHeader, Badge, Tabs, Tab,
  Skeleton, Alert, AlertTitle, AppBar, Toolbar
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subYears, parseISO, differenceInDays } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

import PieChartIcon from '@mui/icons-material/PieChart';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { useRouter } from 'next/navigation';
import LumpsumCalculator from '../../../components/LumpsumCalculator';
import SWPCalculator from '../../../components/SWPCalculator';
import StepUpSIPCalculator from '../../../components/StepUpSIPCalculator';
import StepUpSWPCalculator from '../../../components/StepUpSWPCalculator';

export default function SchemeDetailPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chartPeriod, setChartPeriod] = useState('1year');
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('line');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Unified professional color system
  const colors = {
    // Primary brand colors - Updated to deep teal & sapphire theme
    primary: '#0f62fe',
    primaryLight: '#5aa0ff', 
    primaryDark: '#054ada',
    
    // Accent colors
    accent: '#20b2aa',
    accentLight: '#50d0c8',
    accentDark: '#109082',
    
    // Semantic colors
    success: '#2ecc71',
    successLight: '#61d88a',
    successDark: '#1e9c56',
    
    warning: '#f5a623',
    warningLight: '#f7c15d',
    warningDark: '#d48816',
    
    error: '#ff5c5c',
    errorLight: '#ff8a8a',
    errorDark: '#d94444',
    
    info: '#0095ff',
    infoLight: '#4db6ff',
    infoDark: '#006ad1',
    
    // Neutral colors for text and backgrounds
    neutral: {
      50: '#f6f9fc',
      100: '#edf2f7',
      200: '#d7e2eb',
      300: '#b6c6d4',
      400: '#8ca2b4',
      500: '#617890',
      600: '#44586a',
      700: '#2f3f4d',
      800: '#1f2a33',
      900: '#10171c'
    },
    
    // Text colors
    text: {
      primary: '#0b1f33',
      secondary: '#4a6075',
      muted: '#6b7d8f',
      inverse: '#ffffff'
    },
    
    // Background colors
    background: {
      default: '#f6f9fc',
      secondary: '#edf3f9',
      card: '#ffffff',
      overlay: 'rgba(5, 74, 218, 0.65)'
    },
    
    // Gradient definitions - Updated for cohesive theme
    gradients: {
      primary: 'linear-gradient(135deg, #0f62fe 0%, #5aa0ff 60%, #7fd1ff 100%)',
      accent: 'linear-gradient(135deg, #0f62fe 0%, #20b2aa 100%)',
      success: 'linear-gradient(135deg, #1e9c56 0%, #61d88a 100%)',
      warning: 'linear-gradient(135deg, #f5a623 0%, #f7c15d 100%)',
      error: 'linear-gradient(135deg, #ff5c5c 0%, #ff8a8a 100%)',
      info: 'linear-gradient(135deg, #006ad1 0%, #4db6ff 100%)',
      subtle: 'linear-gradient(135deg, rgba(15, 98, 254, 0.08) 0%, rgba(32, 178, 170, 0.05) 100%)',
      overlay: 'linear-gradient(135deg, rgba(15, 98, 254, 0.9) 0%, rgba(32, 178, 170, 0.85) 100%)'
    },
    
    // Shadow system
    shadows: {
      sm: '0 1px 3px 0 rgba(16, 23, 28, 0.08)',
      md: '0 10px 30px -12px rgba(15, 98, 254, 0.3)',
      lg: '0 20px 45px -20px rgba(15, 98, 254, 0.35)',
      xl: '0 30px 60px -20px rgba(32, 178, 170, 0.35)',
      '2xl': '0 40px 80px -30px rgba(10, 31, 51, 0.4)'
    }
  };

  useEffect(() => {
    fetchSchemeData();
    fetchReturns();
  }, [code]);

  const fetchSchemeData = async () => {
    try {
      const response = await fetch(`/api/scheme/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSchemeData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheme data:', error);
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    const periods = ['1m', '3m', '6m', '1y'];
    const returnsData = {};
    
    for (const period of periods) {
      try {
        const response = await fetch(`/api/scheme/${code}/returns?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.error) {
            returnsData[period] = data;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${period} returns:`, error);
      }
    }


  };

  const calculateSIP = async () => {
    setSipLoading(true);
    try {
      console.log('SIP Form Data:', sipForm);
      console.log('Scheme Code:', code);
      
      const response = await fetch(`/api/scheme/${code}/sip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sipForm),
      });
      
      console.log('SIP Response Status:', response.status);
      const data = await response.json();
      console.log('SIP Response Data:', data);
      
      if (data.error) {
        console.error('SIP API Error:', data.error);
        alert('Error: ' + data.error);
      } else {
        console.log('SIP Result:', data);
        setSipResult(data);
      }
    } catch (error) {
      console.error('Error calculating SIP:', error);
      alert('Failed to calculate SIP: ' + error.message);
    }
    setSipLoading(false);
  };

  const getChartData = () => {
    if (!schemeData?.data) return [];
    
    const periodMap = {
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365,
      '3years': 1095,
      '5years': 1825,
    };
    
    const days = periodMap[chartPeriod] || 365;
    const data = schemeData.data
      .slice(-days)
      .map((item, index, arr) => {
        const date = new Date(item.date);
        const nav = parseFloat(item.nav);
        const prevNav = index > 0 ? parseFloat(arr[index - 1].nav) : nav;
        const change = nav - prevNav;
        const changePercent = prevNav > 0 ? ((change / prevNav) * 100) : 0;
        
        return {
          date: item.date,
          nav: nav,
          change: change,
          changePercent: changePercent,
          formattedDate: isNaN(date.getTime()) ? item.date : format(date, days > 365 ? 'MMM yyyy' : 'MMM dd'),
          fullDate: isNaN(date.getTime()) ? item.date : format(date, 'dd MMM yyyy')
        };
      })
      .reverse();
    
    return data;
  };
  
  const calculateReturns = (data) => {
    if (!data || data.length < 2) return { simple: 0, annualized: 0, absolute: 0, days: 0 };
    
    const startNav = parseFloat(data[0].nav) || 0;
    const endNav = parseFloat(data[data.length - 1].nav) || 0;
    
    // Safely calculate days difference with validation
    let daysDiff = 0;
    try {
      const startDate = new Date(data[0].date);
      const endDate = new Date(data[data.length - 1].date);
      
      // Check if dates are valid
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        daysDiff = differenceInDays(endDate, startDate);
        // Ensure daysDiff is a valid positive number
        if (isNaN(daysDiff) || daysDiff < 0) {
          daysDiff = Math.abs(daysDiff) || 0;
        }
      }
    } catch (error) {
      console.warn('Error calculating date difference:', error);
      daysDiff = 0;
    }
    
    // Calculate returns with validation
    const simpleReturn = startNav > 0 ? ((endNav - startNav) / startNav) * 100 : 0;
    const annualizedReturn = (daysDiff > 0 && startNav > 0) ? 
      (Math.pow(endNav / startNav, 365 / daysDiff) - 1) * 100 : 0;
    
    // Ensure all values are valid numbers
    return { 
      simple: isFinite(simpleReturn) ? simpleReturn : 0, 
      annualized: isFinite(annualizedReturn) ? annualizedReturn : 0,
      absolute: isFinite(endNav - startNav) ? endNav - startNav : 0,
      days: isFinite(daysDiff) ? Math.max(0, daysDiff) : 0
    };
  };
  
  const addToWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ 
          schemeCode: code, 
          schemeName: schemeData?.meta?.scheme_name || 'Unknown Fund'
        })
      });
      if (res.ok) {
        console.log('Added to watchlist successfully');
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Stack alignItems="center" spacing={3}>
              <CircularProgress size={60} sx={{ color: colors.primary }} />
              <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                Loading fund details...
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!schemeData?.meta) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              border: `1px solid ${colors.error}`,
              background: colors.background.card,
              boxShadow: colors.shadows.lg
            }}
          >
            <Typography variant="h5" sx={{ color: colors.error, mb: 2 }}>
              Fund Not Found
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text.secondary, mb: 3 }}>
              Unable to load fund details from MFAPI. Please try again later.
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip 
                label="Go Back" 
                onClick={() => router.back()}
                icon={<ArrowBackIcon />}
                clickable
                sx={{ 
                  px: 3, 
                  py: 1, 
                  fontSize: '1rem',
                  backgroundColor: colors.primary,
                  color: colors.text.inverse,
                  '&:hover': {
                    backgroundColor: colors.primaryDark
                  }
                }}
              />
            </motion.div>
          </Paper>
        </Container>
      </Box>
    );
  }

  const chartData = getChartData();
  const returnsData = calculateReturns(chartData);
  const currentNav = schemeData.data?.[0]?.nav || 0;
  const navDate = schemeData.data?.[0]?.date || '';
  
  // Helper function to safely format dates
  const formatSafeDate = (dateString, formatPattern = 'dd MMMM yyyy', fallback = 'Date not available') => {
    if (!dateString || dateString.trim() === '') {
      return fallback;
    }
    
    try {
      const parsedDate = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date string:', dateString);
        return fallback;
      }
      
      return format(parsedDate, formatPattern);
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return fallback;
    }
  };
  
  // Helper function to safely format numbers
  const formatSafeNumber = (value, decimalPlaces = 2, fallback = '0') => {
    if (typeof value !== 'number' || !isFinite(value) || isNaN(value)) {
      return fallback;
    }
    return value.toFixed(decimalPlaces);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(168, 85, 247, 0.05))',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(168, 85, 247, 0.06))',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          <Stack spacing={4}>
            {/* Enhanced Hero Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  borderRadius: 4,
                  background: colors.gradients.overlay,
                  color: colors.text.inverse,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: colors.shadows['2xl'],
                  border: '1px solid rgba(255,255,255,0.18)'
                }}
              >
                {/* Decorative background elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    filter: 'blur(40px)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    filter: 'blur(60px)'
                  }}
                />

                {/* Top Action Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton 
                      onClick={() => router.back()}
                      sx={{ 
                        color: colors.text.inverse, 
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </motion.div>

                  <Stack direction="row" spacing={2}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        sx={{
                          color: colors.text.inverse,
                          borderColor: 'rgba(255,255,255,0.3)',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            borderColor: 'rgba(255,255,255,0.5)',
                            backgroundColor: 'rgba(255,255,255,0.2)'
                          }
                        }}
                      >
                        Share
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        startIcon={isInWatchlist ? <BookmarkIcon /> : <BookmarkAddOutlinedIcon />}
                        onClick={() => {
                          addToWatchlist();
                          setIsInWatchlist(!isInWatchlist);
                        }}
                        sx={{
                          backgroundColor: colors.background.card,
                          color: colors.primary,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: colors.background.card,
                            transform: 'translateY(-2px)',
                            boxShadow: colors.shadows.xl
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isInWatchlist ? 'Saved' : 'Save'}
                      </Button>
                    </motion.div>
                  </Stack>
                </Box>

                {/* Main Content */}
                <Box textAlign="center" sx={{ position: 'relative', zIndex: 2 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        lineHeight: 1.3,
                        mb: 2
                      }}
                    >
                      {schemeData.meta.scheme_name}
                    </Typography>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ mb: 4 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          width: 60, 
                          height: 60,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <AccountBalanceIcon sx={{ fontSize: '2rem' }} />
                      </Avatar>
                      <Box textAlign="left">
                        <Typography variant="h5" sx={{ color: colors.text.inverse, opacity: 0.95, fontWeight: 600 }}>
                          {schemeData.meta.fund_house}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.text.inverse, opacity: 0.8 }}>
                          {schemeData.meta.scheme_type}
                        </Typography>
                      </Box>
                    </Stack>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 800, mx: 'auto' }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: colors.background.card,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            textAlign: 'center',
                            boxShadow: colors.shadows.md
                          }}
                        >
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: colors.primary }}>
                            ₹{currentNav}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.72, color: colors.text.secondary }}>
                            Current NAV
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: returnsData.simple >= 0 ? colors.gradients.success : colors.gradients.error,
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            textAlign: 'center',
                            boxShadow: colors.shadows.md
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                            {returnsData.simple >= 0 ? <TrendingUpIcon sx={{ color: colors.text.inverse }} /> : <TrendingDownIcon sx={{ color: colors.text.inverse }} />}
                            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text.inverse }}>
                              {returnsData.simple > 0 ? '+' : ''}{formatSafeNumber(returnsData.simple)}%
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ opacity: 0.9, color: colors.text.inverse }}>
                            {chartPeriod} Return
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: colors.background.card,
                            border: `1px solid ${colors.neutral[200]}`,
                            textAlign: 'center',
                            boxShadow: colors.shadows.sm
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: colors.text.primary }}>
                            {returnsData.annualized > 0 ? '+' : ''}{formatSafeNumber(returnsData.annualized)}%
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8, color: colors.text.secondary }}>
                            Annualized Return
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: colors.background.card,
                            border: `1px solid ${colors.neutral[200]}`,
                            textAlign: 'center',
                            boxShadow: colors.shadows.sm
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                            <StarIcon sx={{ color: colors.warning }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text.primary }}>
                              4.5
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ opacity: 0.8, color: colors.text.secondary }}>
                            Rating
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Chip 
                        label={schemeData.meta.scheme_category}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.text.inverse, 
                          fontWeight: 600,
                          fontSize: '1rem',
                          px: 2,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }} 
                      />
                      <Typography variant="body2" sx={{ color: colors.text.inverse, opacity: 0.8, mt: 1 }}>
                        Last updated: {formatSafeDate(navDate, 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
              </Paper>
            </motion.div>

            {/* Enhanced Performance Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: 4,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.8)'
                    : colors.background.card,
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    : colors.shadows.xl,
                  overflow: 'hidden',
                  border: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.3)'
                    : `1px solid ${colors.neutral[200]}`
                }}
              >
                {/* Chart Header with Tabs */}
                <Box sx={{ p: 4, pb: 2 }}>
                  <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={3}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text.primary, mb: 1 }}>
                        Performance Analytics
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                        Interactive charts and detailed performance metrics
                      </Typography>
                    </Box>
                    
                    {/* Chart Type Selector */}
                    <Stack direction="row" spacing={1}>
                      {[
                        { type: 'area', icon: <ShowChartIcon />, label: 'Area' },
                        { type: 'line', icon: <TimelineIcon />, label: 'Line' }
                      ].map((chart) => (
                        <motion.div key={chart.type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant={chartType === chart.type ? 'contained' : 'outlined'}
                            startIcon={chart.icon}
                            onClick={() => setChartType(chart.type)}
                            size="small"
                            sx={{
                              minWidth: 100,
                              ...(chartType === chart.type && {
                                background: colors.gradients.primary,
                                color: colors.text.inverse,
                                '&:hover': {
                                  background: colors.gradients.primary,
                                  opacity: 0.9
                                }
                              })
                            }}
                          >
                            {chart.label}
                          </Button>
                        </motion.div>
                      ))}
                    </Stack>
                  </Stack>
                  
                  {/* Time Period Selector */}
                  <Box sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {[
                        { period: '1month', label: '1M' },
                        { period: '3months', label: '3M' },
                        { period: '6months', label: '6M' },
                        { period: '1year', label: '1Y' },
                        { period: '3years', label: '3Y' },
                        { period: '5years', label: '5Y' }
                      ].map((item) => (
                        <motion.div 
                          key={item.period} 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }}
                        >
                          <Chip
                            label={item.label}
                            variant={chartPeriod === item.period ? 'filled' : 'outlined'}
                            onClick={() => setChartPeriod(item.period)}
                            sx={{ 
                              fontWeight: 700,
                              cursor: 'pointer',
                              px: 2,
                              py: 1,
                              height: 40,
                              fontSize: '0.9rem',
                              transition: 'all 0.2s ease',
                              ...(chartPeriod === item.period && {
                                background: colors.gradients.primary,
                                color: colors.text.inverse,
                                boxShadow: `0 4px 15px ${colors.primary}40`
                              })
                            }}
                          />
                        </motion.div>
                      ))}
                    </Stack>
                  </Box>
                </Box>
                
                {/* Chart Container */}
                <Box sx={{ px: 4, pb: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(30, 41, 59, 0.6)'
                          : colors.gradients.subtle,
                        border: (theme) => theme.palette.mode === 'dark'
                          ? '1px solid rgba(71, 85, 105, 0.3)'
                          : `1px solid ${colors.neutral[200]}`
                      }}
                  >
                    <Box sx={{ width: '100%', height: 600 }}>
                      <ResponsiveContainer>
                        {chartType === 'area' && (
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis 
                              dataKey="formattedDate" 
                              tick={{ fill: colors.neutral[500], fontSize: 12, fontWeight: 500 }}
                              axisLine={{ stroke: colors.neutral[300], strokeWidth: 1 }}
                              tickLine={{ stroke: colors.neutral[300] }}
                            />
                            <YAxis 
                              tick={{ fill: colors.neutral[500], fontSize: 12, fontWeight: 500 }}
                              axisLine={{ stroke: colors.neutral[300], strokeWidth: 1 }}
                              tickLine={{ stroke: colors.neutral[300] }}
                              domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <ChartTooltip
                              contentStyle={{
                                backgroundColor: colors.background.card,
                                border: `2px solid ${colors.primary}`,
                                borderRadius: '12px',
                                boxShadow: colors.shadows.xl,
                                fontSize: '14px'
                              }}
                              labelStyle={{ color: colors.text.primary, fontWeight: 700 }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="nav" 
                              stroke="#7c3aed"
                              strokeWidth={2}
                              fill="url(#navGradient)"
                              dot={false}
                              activeDot={{ r: 4, stroke: "#7c3aed", strokeWidth: 2, fill: 'white' }}
                            />
                          </AreaChart>
                        )}
                        
                        {chartType === 'line' && (
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis 
                              dataKey="formattedDate" 
                              tick={{ fill: colors.neutral[500], fontSize: 12, fontWeight: 500 }}
                              axisLine={{ stroke: colors.neutral[300] }}
                            />
                            <YAxis 
                              tick={{ fill: colors.neutral[500], fontSize: 12, fontWeight: 500 }}
                              axisLine={{ stroke: colors.neutral[300] }}
                              domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <ChartTooltip
                              contentStyle={{
                                backgroundColor: colors.background.card,
                                border: `2px solid ${colors.primary}`,
                                borderRadius: '12px',
                                boxShadow: colors.shadows.xl
                              }}
                              labelStyle={{ color: colors.text.primary, fontWeight: 700 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="nav" 
                              stroke="#7c3aed"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, stroke: "#7c3aed", strokeWidth: 2, fill: 'white' }}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </Box>
                    
                    {/* Chart Statistics */}
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${colors.neutral[200]}` }}>
                      <Grid container spacing={3}>
                        <Grid item xs={6} md={3}>
                          <Stack alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.primary }}>
                              ₹{Math.min(...chartData.map(d => d.nav)).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                              Lowest NAV
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Stack alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.success }}>
                              ₹{Math.max(...chartData.map(d => d.nav)).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                              Highest NAV
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Stack alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.info }}>
                              ₹{(chartData.reduce((sum, d) => sum + d.nav, 0) / chartData.length).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                              Average NAV
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Stack alignItems="center" spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: colors.warning }}>
                              {formatSafeNumber(returnsData.days, 0)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                              Data Points
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Box>
              </Paper>
            </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    background: colors.gradients.info,
                    color: colors.text.inverse,
                    textAlign: 'center',
                    boxShadow: colors.shadows.lg
                  }}
                >
                  <TimelineIcon sx={{ fontSize: '3rem', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    {returnsData.simple > 0 ? '+' : ''}{formatSafeNumber(returnsData.simple)}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Return ({chartPeriod})
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    background: colors.gradients.warning,
                    color: colors.text.inverse,
                    textAlign: 'center',
                    boxShadow: colors.shadows.lg
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: '3rem', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    {returnsData.annualized > 0 ? '+' : ''}{formatSafeNumber(returnsData.annualized)}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Annualized Return
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    background: returnsData.absolute >= 0 ? 
                      colors.gradients.success :
                      colors.gradients.error,
                    color: colors.text.inverse,
                    textAlign: 'center',
                    boxShadow: colors.shadows.lg
                  }}
                >
                  {returnsData.absolute >= 0 ? 
                    <TrendingUpIcon sx={{ fontSize: '3rem', mb: 1 }} /> :
                    <TrendingDownIcon sx={{ fontSize: '3rem', mb: 1 }} />
                  }
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    ₹{formatSafeNumber(Math.abs(returnsData.absolute))}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Absolute Change
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    background: colors.gradients.primary,
                    color: colors.text.inverse,
                    textAlign: 'center',
                    boxShadow: colors.shadows.lg
                  }}
                >
                  <AccountBalanceIcon sx={{ fontSize: '3rem', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    {formatSafeNumber(returnsData.days, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Days of Data
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* Fund Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(30, 41, 59, 0.8)'
                  : colors.background.card,
                border: (theme) => theme.palette.mode === 'dark'
                  ? '1px solid rgba(71, 85, 105, 0.3)'
                  : `1px solid ${colors.neutral[200]}`,
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                  : colors.shadows.lg
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text.primary, mb: 3 }}>
                Fund Information
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Scheme Code
                      </Typography>
                      <Chip 
                        label={schemeData.meta.scheme_code} 
                        sx={{ 
                          background: colors.gradients.primary,
                          color: colors.text.inverse,
                          fontWeight: 600,
                          fontSize: '1rem'
                        }} 
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Fund House
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                        {schemeData.meta.fund_house}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Scheme Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: colors.text.primary }}>
                        {schemeData.meta.scheme_type}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Category
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                        {schemeData.meta.scheme_category}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Current NAV
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                        ₹{currentNav}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 0.5 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: colors.text.primary }}>
                        {formatSafeDate(navDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Calculators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Stack spacing={4}>
              <LumpsumCalculator schemeCode={code} />
              <SWPCalculator schemeCode={code} />
              <StepUpSIPCalculator schemeCode={code} />
              <StepUpSWPCalculator schemeCode={code} />
            </Stack>
          </motion.div>
          </Stack>
        </AnimatePresence>
      </Container>
    </Box>
  );
}
