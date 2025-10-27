'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  Typography, TextField, Grid, Card, CardContent, CardActionArea,
  Box, Chip, CircularProgress, InputAdornment, Container, Paper,
  Stack, Fade, Button, IconButton, Tooltip, Snackbar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedAnimatedCard from '../../components/EnhancedAnimatedCard';
import { GridSkeleton, EmptyState } from '../../components/LoadingSkeletons';

function TrendingFundsContent() {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [displayedFunds, setDisplayedFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(12);
  const [sortBy, setSortBy] = useState('trending');
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
          schemeCode: fund._id || fund.schemeCode || fund.name, 
          schemeName: fund.name || fund.schemeName || fund.fundName 
        })
      });
      if (!res.ok) throw new Error('failed');
      setSnack({ open: true, msg: 'Added to watchlist' });
    } catch (error) {
      setSnack({ open: true, msg: 'Failed to add to watchlist' });
    }
  };

  // Define filterFunds before it is referenced in effects to avoid TDZ issues
  const filterFunds = useCallback(() => {
    let filtered = searchTerm
      ? funds.filter(fund => {
          const name = fund.name || fund.schemeName || fund.fundName || '';
          const category = fund.category || '';
          return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 category.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : funds;
      
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.name || a.schemeName || a.fundName || '';
        const nameB = b.name || b.schemeName || b.fundName || '';
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'change') {
      filtered = [...filtered].sort((a, b) => (b.navChangePercent || 0) - (a.navChangePercent || 0));
    } else if (sortBy === 'nav') {
      filtered = [...filtered].sort((a, b) => (b.nav || 0) - (a.nav || 0));
    } else if (sortBy === 'trending') {
      // Keep original trending order
    }
    
    setFilteredFunds(filtered);
    setItemsToShow(12);
  }, [searchTerm, funds, sortBy]);

  useEffect(() => {
    fetchTrendingFunds();
    // Get search query from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    filterFunds();
  }, [filterFunds]);

  useEffect(() => {
    setDisplayedFunds(filteredFunds.slice(0, itemsToShow));
  }, [filteredFunds, itemsToShow]);

  const fetchTrendingFunds = async () => {
    try {
      setLoading(true);
      
      // IMMEDIATE SOLUTION: Use emergency trending fallback to guarantee data
      const resEmergencyTrending = await fetch('/api/emergency-trending-funds', { cache: 'no-store' });
      if (resEmergencyTrending.ok) {
        const dataEmergencyTrending = await resEmergencyTrending.json();
        if (dataEmergencyTrending.success && dataEmergencyTrending.trendingFunds && Array.isArray(dataEmergencyTrending.trendingFunds) && dataEmergencyTrending.trendingFunds.length > 0) {
          console.log(' EMERGENCY TRENDING FALLBACK: Using emergency trending data:', dataEmergencyTrending.trendingFunds.length, 'trending funds found');
          console.log(' Note:', dataEmergencyTrending.note);
          setFunds(dataEmergencyTrending.trendingFunds);
          setFilteredFunds(dataEmergencyTrending.trendingFunds);
          setLoading(false);
          return;
        }
      }
      
      // ATTEMPT 1: Try the working trending funds endpoint
      const resWorkingTrending = await fetch('/api/working-trending-funds', { cache: 'no-store' });
      if (resWorkingTrending.ok) {
        const dataWorkingTrending = await resWorkingTrending.json();
        if (dataWorkingTrending.success && dataWorkingTrending.trendingFunds && Array.isArray(dataWorkingTrending.trendingFunds) && dataWorkingTrending.trendingFunds.length > 0) {
          console.log(' ATTEMPT: Using working trending funds endpoint:', dataWorkingTrending.trendingFunds.length, 'trending funds found');
          setFunds(dataWorkingTrending.trendingFunds);
          setFilteredFunds(dataWorkingTrending.trendingFunds);
          setLoading(false);
          return;
        }
      }
      
      // FALLBACK: Try the original trending funds API
      const resTrending = await fetch('/api/funds/trending', { cache: 'no-store' });
      if (resTrending.ok) {
        const dataTrending = await resTrending.json();
        if (Array.isArray(dataTrending) && dataTrending.length > 0) {
          console.log(' FALLBACK: Using original trending funds API:', dataTrending.length);
          setFunds(dataTrending);
          setFilteredFunds(dataTrending);
          setLoading(false);
          return;
        }
      }

      console.warn('No trending funds data available from any endpoint');
    } catch (error) {
      console.error('Error fetching trending funds:', error);
    }
    setLoading(false);
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 12);
  };

  const handleFundClick = (fund) => {
    const identifier = fund._id || fund.schemeCode || fund.name;
    if (identifier) {
      router.push(`/scheme/${identifier}`);
    }
  };

  const getTrendChip = (fund) => {
    const change = fund.navChangePercent;
    if (typeof change === 'number') {
      return {
        label: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        color: change >= 0 ? 'success' : 'error',
        icon: change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />
      };
    }
    return {
      label: 'Trending',
      color: 'warning',
      icon: <WhatshotIcon />
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
          <Box textAlign="center">
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              className="heading-lg"
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Trending Mutual Funds
            </Typography>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <WhatshotIcon sx={{ color: 'warning.main', fontSize: '2rem' }} />
              <Typography 
                variant="h6" 
                color="text.secondary"
                className="body-lg"
              >
                Top performing and most viewed mutual funds
              </Typography>
            </Stack>
            
            <Chip 
              icon={<WhatshotIcon />} 
              label={`${filteredFunds.length} Trending Funds`} 
              color="warning" 
              variant="outlined"
              sx={{ fontWeight: 600, px: 2, py: 0.5 }}
            />
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
              p: 4, 
              borderRadius: 4, 
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search trending mutual funds..."
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
                {loading ? 'Loading...' : `Showing ${displayedFunds.length} of ${filteredFunds.length} trending funds`}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Chip 
                    icon={<WhatshotIcon />} 
                    label="Hot & Trending" 
                    color="warning" 
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
                    <MenuItem value="trending">Trending Score</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="change">% Change</MenuItem>
                    <MenuItem value="nav">NAV</MenuItem>
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
                      color={searchTerm.toLowerCase().includes(filter.q.toLowerCase()) ? 'warning' : 'default'}
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
            title="No trending funds found"
            description={searchTerm ? `No results for "${searchTerm}". Try adjusting your search terms or browse our popular categories.` : "No trending mutual funds available at the moment."}
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
            <Grid container spacing={4}>
              <AnimatePresence>
                {displayedFunds.map((fund, index) => {
                  const trendChip = getTrendChip(fund);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={fund._id || index}>
                      <EnhancedAnimatedCard
                        title={fund.name || fund.schemeName || fund.fundName}
                        subtitle={`${fund.nav ? `NAV: ₹${fund.nav}` : ''} ${fund.lastUpdated ? `• ${new Date(fund.lastUpdated).toLocaleDateString()}` : ''}`}
                        category={fund.category || 'Trending Fund'}
                        badge={trendChip.label}
                        badgeColor={trendChip.color}
                        onBookmarkToggle={() => addToWatchlist(fund)}
                        onClick={() => handleFundClick(fund)}
                        delay={0}
                        index={index}
                      />
                    </Grid>
                  );
                })}
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
                      Load More Trending Funds
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
  );
}

export default function TrendingFundsPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading trending funds...</Typography>
        </Box>
      </Container>
    }>
      <TrendingFundsContent />
    </Suspense>
  );
}