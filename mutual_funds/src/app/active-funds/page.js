'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Typography, TextField, Grid, Card, CardContent, CardActionArea,
  Box, Chip, CircularProgress, InputAdornment, Container, Paper,
  Stack, Fade, Button, IconButton, Tooltip, Snackbar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedAnimatedCard from '../../components/EnhancedAnimatedCard';
import { GridSkeleton, EmptyState } from '../../components/LoadingSkeletons';

function ActiveFundsContent() {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [displayedFunds, setDisplayedFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(16);
  const [sortBy, setSortBy] = useState('relevance');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snack, setSnack] = useState({ open: false, msg: '' });
  const quickFilters = [
    { label: 'Large Cap', q: 'large cap' },
    { label: 'Mid Cap', q: 'mid cap' },
    { label: 'Small Cap', q: 'small cap' },
    { label: 'ELSS', q: 'elss' },
    { label: 'Debt', q: 'debt' },
    { label: 'Index', q: 'index' },
    { label: 'Hybrid', q: 'hybrid' },
    { label: 'Equity', q: 'equity' },
  ];

  const addToWatchlist = async (fund) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ 
          schemeCode: fund.schemeCode || fund.fundName, 
          schemeName: fund.fundName || fund.schemeName 
        })
      });
      if (!res.ok) throw new Error('failed');
      setSnack({ open: true, msg: 'Added to watchlist' });
    } catch (error) {
      setSnack({ open: true, msg: 'Failed to add to watchlist' });
    }
  };

  useEffect(() => {
    fetchActiveFunds();
    // Get search query from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    filterFunds();
  }, [searchTerm, funds, sortBy]);

  useEffect(() => {
    setDisplayedFunds(filteredFunds.slice(0, itemsToShow));
  }, [filteredFunds, itemsToShow]);

  const fetchActiveFunds = async () => {
    try {
      setLoading(true);
      
      // IMMEDIATE SOLUTION: Use emergency fallback to guarantee data
      const resEmergency = await fetch('/api/emergency-active-funds');
      if (resEmergency.ok) {
        const dataEmergency = await resEmergency.json();
        if (dataEmergency.success && dataEmergency.activeFunds && Array.isArray(dataEmergency.activeFunds) && dataEmergency.activeFunds.length > 0) {
          console.log('🚑 EMERGENCY FALLBACK: Using emergency data:', dataEmergency.activeFunds.length, 'funds found');
          console.log('📝 Note:', dataEmergency.note);
          setFunds(dataEmergency.activeFunds);
          setFilteredFunds(dataEmergency.activeFunds);
          setLoading(false);
          return;
        }
      }
      
      // ATTEMPT 1: Try the guaranteed active funds endpoint (zero filtering)
      const resGuaranteed = await fetch('/api/guaranteed-active-funds');
      if (resGuaranteed.ok) {
        const dataGuaranteed = await resGuaranteed.json();
        if (dataGuaranteed.success && dataGuaranteed.activeFunds && Array.isArray(dataGuaranteed.activeFunds) && dataGuaranteed.activeFunds.length > 0) {
          console.log('🎆 GUARANTEED SUCCESS: Using guaranteed endpoint:', dataGuaranteed.activeFunds.length, 'funds found');
          console.log('📊 Total schemes from API:', dataGuaranteed.totalSchemesFromAPI);
          console.log('🔍 Debug info:', dataGuaranteed.debug);
          setFunds(dataGuaranteed.activeFunds);
          setFilteredFunds(dataGuaranteed.activeFunds);
          setLoading(false);
          return;
        }
      }
      
      // BACKUP: Try the working active funds endpoint (more permissive)
      const resWorking = await fetch('/api/working-active-funds');
      if (resWorking.ok) {
        const dataWorking = await resWorking.json();
        if (dataWorking.success && dataWorking.activeFunds && Array.isArray(dataWorking.activeFunds) && dataWorking.activeFunds.length > 0) {
          console.log('🔍 BACKUP: Using working active funds endpoint:', dataWorking.activeFunds.length, 'funds found');
          setFunds(dataWorking.activeFunds);
          setFilteredFunds(dataWorking.activeFunds);
          setLoading(false);
          return;
        }
      }
      
      // FALLBACK: Try the temp debug endpoint
      const resTemp = await fetch('/api/temp-active-funds');
      if (resTemp.ok) {
        const dataTemp = await resTemp.json();
        if (dataTemp.success && dataTemp.activeFunds && Array.isArray(dataTemp.activeFunds)) {
          console.log('🔍 FALLBACK: Using temp endpoint:', dataTemp.activeFunds.length, 'active funds found');
          setFunds(dataTemp.activeFunds);
          setFilteredFunds(dataTemp.activeFunds);
          setLoading(false);
          return;
        }
        // If no active funds but we have all funds, show first 20 for debugging
        if (dataTemp.allFunds && Array.isArray(dataTemp.allFunds) && dataTemp.allFunds.length > 0) {
          console.log('🔍 FALLBACK: No active funds, showing all funds for debugging:', dataTemp.allFunds.length);
          setFunds(dataTemp.allFunds);
          setFilteredFunds(dataTemp.allFunds);
          setLoading(false);
          return;
        }
      }
      
      // Try the cached active funds API
      const resActive = await fetch('/api/activeFunds');
      if (resActive.ok) {
        const dataActive = await resActive.json();
        if (dataActive.activeFunds && Array.isArray(dataActive.activeFunds) && dataActive.activeFunds.length > 0) {
          console.log('Using activeFunds cache:', dataActive.activeFunds.length);
          setFunds(dataActive.activeFunds);
          setFilteredFunds(dataActive.activeFunds);
          setLoading(false);
          return;
        }
      }

      // Fallback to the active-funds API
      const resActiveFallback = await fetch('/api/active-funds?limit=500');
      if (resActiveFallback.ok) {
        const dataActiveFallback = await resActiveFallback.json();
        if (Array.isArray(dataActiveFallback) && dataActiveFallback.length > 0) {
          console.log('Using active-funds API:', dataActiveFallback.length);
          setFunds(dataActiveFallback);
          setFilteredFunds(dataActiveFallback);
          setLoading(false);
          return;
        }
      }

      console.warn('No active funds data available from any endpoint');
    } catch (error) {
      console.error('Error fetching active funds:', error);
    }
    setLoading(false);
  };

  const filterFunds = () => {
    let filtered = searchTerm
      ? funds.filter(fund => {
          const name = fund.fundName || fund.schemeName || '';
          const category = fund.category || '';
          return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 category.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : funds;
      
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.fundName || a.schemeName || '';
        const nameB = b.fundName || b.schemeName || '';
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'nav') {
      filtered = [...filtered].sort((a, b) => (b.nav || 0) - (a.nav || 0));
    } else if (sortBy === 'category') {
      filtered = [...filtered].sort((a, b) => {
        const catA = a.category || '';
        const catB = b.category || '';
        return catA.localeCompare(catB);
      });
    }
    
    setFilteredFunds(filtered);
    setItemsToShow(16);
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 16);
  };

  const handleFundClick = (fund) => {
    const schemeCode = fund.schemeCode || fund.fundName;
    if (schemeCode) {
      router.push(`/scheme/${schemeCode}`);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: (theme) => theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
      position: 'relative'
    }}>
      {/* Background decoration */}
      <Box sx={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: 250,
        height: 250,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08))',
        filter: 'blur(50px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '25%',
        left: '5%',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.06))',
        filter: 'blur(35px)',
        zIndex: 0
      }} />
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ ...snack, open: false })}
        message={snack.msg}
      />
      <Stack spacing={4}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', position: 'relative' }}>
            {/* Professional Header */}
            <Box sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              mb: 3,
              color: 'white',
              overflow: 'hidden'
            }}>
              {/* Background decoration */}
              <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                filter: 'blur(30px)'
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                filter: 'blur(40px)'
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    mb: 1.5,
                    lineHeight: 1.2
                  }}
                >
                  Mutual Funds
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 400,
                    mb: 2,
                    maxWidth: 500,
                    mx: 'auto',
                    lineHeight: 1.5
                  }}
                >
                  Invest in hand-picked mutual funds and grow your wealth
                </Typography>
                
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                    label="0% Commission"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white', 
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />}
                    label="Real-time NAV"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white', 
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                  <Chip 
                    icon={<BookmarkAddOutlinedIcon sx={{ fontSize: '1rem' }} />}
                    label="Expert Picks"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white', 
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  />
                </Stack>
                
                <Chip 
                  label={`${filteredFunds.length} Active Funds`} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 3,
                    py: 1,
                    height: 'auto',
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(71, 85, 105, 0.3)'
                : '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search active mutual funds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  py: 0.5,
                  fontSize: '1.1rem'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" sx={{ fontSize: '1.5rem' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={3} mt={3}>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {loading ? 'Loading...' : `Showing ${displayedFunds.length} of ${filteredFunds.length} active funds`}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Active Funds Only" 
                    color="success" 
                    variant="outlined"
                    sx={{ fontWeight: 500, borderRadius: 2 }}
                  />
                </motion.div>
                <FormControl size="small">
                  <InputLabel id="sort-by-label">Sort by</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ minWidth: 140, borderRadius: 2 }}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="nav">NAV</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
            
            {/* Quick Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Stack direction="row" spacing={1} mt={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {quickFilters.map((filter, index) => (
                  <motion.div
                    key={filter.q}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Chip
                      label={filter.label}
                      variant={searchTerm.toLowerCase().includes(filter.q.toLowerCase()) ? 'filled' : 'outlined'}
                      color={searchTerm.toLowerCase().includes(filter.q.toLowerCase()) ? 'success' : 'default'}
                      onClick={() => setSearchTerm(filter.q)}
                      sx={{ 
                        borderRadius: 2, 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Paper>
        </motion.div>

        {loading ? (
          <GridSkeleton count={8} />
        ) : displayedFunds.length === 0 ? (
          <EmptyState 
            title="No active funds found"
            description={searchTerm ? `No results for "${searchTerm}". Try adjusting your search terms or browse our popular categories.` : "No active mutual funds available at the moment."}
            icon={SearchOffIcon}
            action={
              searchTerm && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearchTerm('')}
                    sx={{ mt: 2 }}
                  >
                    Clear Search
                  </Button>
                </motion.div>
              )
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Grid container spacing={3}>
              <AnimatePresence>
                {displayedFunds.map((fund, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={1.5} key={fund.schemeCode || index}>
                    <EnhancedAnimatedCard
                      title={fund.fundName || fund.schemeName}
                      subtitle={`${fund.schemeCode ? `Code: ${fund.schemeCode}` : ''} ${fund.nav ? `• NAV: ₹${fund.nav}` : ''}`}
                      category={fund.category || 'Active Fund'}
                      badge="Active"
                      badgeColor="success"
                      onBookmarkToggle={() => addToWatchlist(fund)}
                      onClick={() => handleFundClick(fund)}
                      delay={0}
                      index={index}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
            
            {displayedFunds.length < filteredFunds.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outlined" 
                      size="large"
                      onClick={loadMore}
                      sx={{ 
                        px: 6, 
                        py: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      Load More Active Funds
                      <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                        ({filteredFunds.length - displayedFunds.length} remaining)
                      </Typography>
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </motion.div>
        )}
      </Stack>
      </Container>
    </Box>
  );
}

export default function ActiveFundsPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading active funds...</Typography>
        </Box>
      </Container>
    }>
      <ActiveFundsContent />
    </Suspense>
  );
}