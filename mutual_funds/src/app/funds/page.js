'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import {
  Typography,
  TextField,
  Grid,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Container,
  Paper,
  Skeleton,
  Stack,
  Fade,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Avatar,
  Tabs,
  Tab,
  useMediaQuery,
  LinearProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedAnimatedCard from '../../components/EnhancedAnimatedCard';
import { GridSkeleton, EmptyState } from '../../components/LoadingSkeletons';
import axios from 'axios';

const curatedCollections = [
  {
    title: 'Stable Growth Leaders',
    description: 'Top-performing large-cap funds curated for consistent compounding.',
    badge: 'Stability',
    color: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.25))',
    query: 'large cap'
  },
  {
    title: 'Value Opportunities',
    description: 'Funds with attractive valuations and disciplined portfolio managers.',
    badge: 'Value Focus',
    color: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(14, 165, 233, 0.25))',
    query: 'value'
  },
  {
    title: 'Tax Planning Suite',
    description: 'ELSS funds with 3-year lock-in and upside potential.',
    badge: 'Tax Saver',
    color: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(249, 115, 22, 0.22))',
    query: 'elss'
  }
];

function FundsContent() {
  const theme = useTheme();
  const isTablet = useMediaQuery('(max-width:1024px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [displayedSchemes, setDisplayedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(8);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
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
  ];
  const promiseBadges = [
    'Zero commission execution',
    'AMFI registered advisors',
    'SEBI compliant onboarding',
    'Institutional grade analytics'
  ];

  const addToWatchlist = async (s) => {
    try {
      const res = await axios.post(
        '/api/watchlist',
        { schemeCode: s.schemeCode, schemeName: s.schemeName },
        { headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' } }
      );
      if (res.status >= 200 && res.status < 300) {
        setSnack({ open: true, msg: 'Added to watchlist' });
      } else {
        throw new Error('failed');
      }
    } catch (error) {
      setSnack({ open: true, msg: 'Failed to add to watchlist' });
    }
  };

  useEffect(() => {
    fetchSchemes();
    // Get search query from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    filterSchemes();
  }, [searchTerm, schemes, sortBy]);

  useEffect(() => {
    setDisplayedSchemes(filteredSchemes.slice(0, itemsToShow));
  }, [filteredSchemes, itemsToShow]);

  const fetchSchemes = async () => {
    try {
      // 1) Try active funds API (DB-backed)
      const resActive = await axios.get('/api/active-funds');
      const dataActive = Array.isArray(resActive.data) ? resActive.data : (resActive.data?.activeFunds || []);
      if (Array.isArray(dataActive) && dataActive.length > 0) {
        // Only consider active where nav > 0 as requested
        const activeByNav = dataActive.filter((s) => Number(s?.nav) > 0);
        console.log('Using active-funds:', dataActive.length, 'activeByNav:', activeByNav.length);
        setSchemes(activeByNav);
        setFilteredSchemes(activeByNav);
        setLoading(false);
        return;
      }

      // 2) Fallback to direct MF API if active-funds is empty/unavailable
      const resAll = await axios.get('/api/mf');
      const dataAll = Array.isArray(resAll.data) ? resAll.data : [];
      console.log('Fallback /api/mf count:', dataAll?.length || 0);
      if (Array.isArray(dataAll) && dataAll.length > 0) {
        setSchemes(dataAll);
        setFilteredSchemes(dataAll);
        // Show all schemes in explore section
        setItemsToShow(dataAll.length);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
    setLoading(false);
  };

  const curatedLists = useMemo(() => {
    const explorer = Array.isArray(schemes) ? schemes : [];
    return curatedCollections.map((collection) => {
      const items = explorer.filter((scheme) =>
        String(scheme.schemeName || '').toLowerCase().includes(collection.query)
      );
      return { ...collection, items: items.slice(0, 4) };
    });
  }, [schemes]);

  const filterSchemes = () => {
    let filtered = searchTerm
      ? schemes.filter(scheme =>
          String(scheme.schemeName || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      : schemes;

    if (activeTab !== 'all') {
      filtered = filtered.filter((scheme) =>
        String(scheme.schemeName || '').toLowerCase().includes(activeTab.toLowerCase())
      );
    }

    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => String(a.schemeName).localeCompare(String(b.schemeName)));
    } else if (sortBy === 'code') {
      filtered = [...filtered].sort((a, b) => String(a.schemeCode).localeCompare(String(b.schemeCode)));
    }

    setFilteredSchemes(filtered);
    setItemsToShow(filtered.length);
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 6);
  };

  const handleSchemeClick = (schemeCode) => {
    router.push(`/scheme/${schemeCode}`);
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card sx={{ height: 140 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ mt: 1, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(236,72,153,0.16), transparent 55%)',
          opacity: 0.85
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ ...snack, open: false })}
        message={snack.msg}
      />
      <Stack spacing={{ xs: 5, md: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: { xs: 4, md: 'var(--radius-2xl)' },
              p: { xs: 4, md: 6 },
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(51,65,85,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.95) 100%)',
              border: '1px solid rgba(148,163,184,0.18)',
              boxShadow: '0 40px 120px -45px rgba(99,102,241,0.55)'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 55%), radial-gradient(circle at bottom right, rgba(236,72,153,0.25), transparent 50%)',
                opacity: 0.75,
                pointerEvents: 'none'
              }}
            />
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack spacing={3}>
                  <Box>
                    <Chip
                      label="Institutional Explorer"
                      color="primary"
                      sx={{
                        width: 'fit-content',
                        fontWeight: 600,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        borderRadius: 2,
                        background: 'rgba(99,102,241,0.18)',
                        border: '1px solid rgba(99,102,241,0.35)',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    className="heading-lg"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 75%, #22d3ee 100%)',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Curate. Compare. Commit with Confidence.
                  </Typography>
                  <Typography className="body-lg" sx={{ maxWidth: 600 }}>
                    Navigate India&apos;s most comprehensive mutual fund universe with deep analytics,
                    premium research narratives, and concierge-style onboarding experiences.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                    {promiseBadges.map((badge) => (
                      <Chip
                        key={badge}
                        label={badge}
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          borderColor: 'rgba(148,163,184,0.35)',
                          color: 'rgba(226, 232, 240, 0.95)',
                          fontWeight: 500,
                          backdropFilter: 'blur(12px)'
                        }}
                      />
                    ))}
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="large"
                        variant="contained"
                        href="#discover"
                        sx={{
                          px: 4,
                          py: 1.7,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                          boxShadow: '0 25px 65px -28px rgba(99,102,241,0.75)',
                          fontWeight: 600
                        }}
                      >
                        Explore Premium Funds
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="large"
                        variant="outlined"
                        href="/compare"
                        sx={{
                          px: 4,
                          py: 1.7,
                          borderRadius: 3,
                          borderColor: 'rgba(148,163,184,0.35)',
                          color: 'inherit',
                          fontWeight: 600,
                          backdropFilter: 'blur(12px)' 
                        }}
                      >
                        Compare & Benchmark
                      </Button>
                    </motion.div>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    p: { xs: 3, md: 4 },
                    borderRadius: 'var(--radius-2xl)',
                    background: 'rgba(15,23,42,0.55)',
                    border: '1px solid rgba(148,163,184,0.25)',
                    backdropFilter: 'blur(28px)',
                    boxShadow: '0 40px 120px -50px rgba(15,23,42,0.75)'
                  }}
                >
                  <Typography variant="overline" sx={{ letterSpacing: 2, color: 'var(--accent-teal)' }}>
                    Smart Suggestions
                  </Typography>
                  <Stack spacing={2.5} sx={{ pt: 2 }}>
                    {curatedLists.map((collection) => (
                      <motion.div
                        key={collection.title}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            background: collection.color,
                            border: '1px solid rgba(148,163,184,0.22)',
                            transition: 'transform 0.25s ease'
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={collection.badge}
                                size="small"
                                sx={{
                                  background: 'rgba(15,23,42,0.55)',
                                  color: 'rgba(226,232,240,0.95)',
                                  backdropFilter: 'blur(10px)'
                                }}
                              />
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {collection.title}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {collection.description}
                            </Typography>
                            {collection.items.length > 0 ? (
                              <Stack spacing={1.2}>
                                {collection.items.map((item) => (
                                  <Button
                                    key={item.schemeCode}
                                    onClick={() => handleSchemeClick(item.schemeCode)}
                                    sx={{
                                      justifyContent: 'space-between',
                                      borderRadius: 2,
                                      px: 1.5,
                                      color: 'inherit'
                                    }}
                                    endIcon={<TrendingUpIcon fontSize="small" />}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {item.schemeName}
                                    </Typography>
                                  </Button>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Coming soon…
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
        
        {/* Search Section */}
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
              placeholder="Search mutual funds by name..."
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
                {loading ? 'Loading...' : `Showing ${displayedSchemes.length} of ${filteredSchemes.length} schemes`}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label={schemes.length > 0 && schemes[0]?.date ? 'Active Today' : 'Live Data'} 
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
                    <MenuItem value="code">Code</MenuItem>
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
                      color={searchTerm.toLowerCase().includes(filter.q.toLowerCase()) ? 'primary' : 'default'}
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
        ) : displayedSchemes.length === 0 ? (
          <EmptyState 
            title="No funds found"
            description={searchTerm ? `No results for "${searchTerm}". Try adjusting your search terms or browse our popular categories.` : "No mutual funds available at the moment."}
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
                {displayedSchemes.map((scheme, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={scheme.schemeCode}>
                    <EnhancedAnimatedCard
                      title={scheme.schemeName}
                      subtitle={`Code: ${scheme.schemeCode}`}
                      category={Number(scheme?.nav) > 0 ? 'Active Fund' : 'Fund'}
                      onBookmarkToggle={() => addToWatchlist(scheme)}
                      onClick={() => handleSchemeClick(scheme.schemeCode)}
                      delay={0}
                      index={index}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
            
            {displayedSchemes.length < filteredSchemes.length && (
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
                      Load More Schemes
                      <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                        ({filteredSchemes.length - displayedSchemes.length} remaining)
                      </Typography>
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </motion.div>
        )}
      </Stack>
      </Box>
    </Container>
  );
}

export default function FundsPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading funds...</Typography>
        </Box>
      </Container>
    }>
      <FundsContent />
    </Suspense>
  );
}