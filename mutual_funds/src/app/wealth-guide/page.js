'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Stack, Grid, Button, Chip, Card, CardContent, CircularProgress, Alert, IconButton, Tooltip, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Script from 'next/script';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import Link from 'next/link';
import EnhancedAnimatedCard from '../../components/EnhancedAnimatedCard';

export default function WealthGuidePage() {
  const [heroSrc, setHeroSrc] = useState('https://lottie.host/ca69f1cc-600b-4fd9-a4b6-17f12fd5d29c/1u1P7CN4J2.lottie');
  const [activeFunds, setActiveFunds] = useState([]);
  const [afLoading, setAfLoading] = useState(true);
  const [afError, setAfError] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [staleData, setStaleData] = useState(false);
  const [apiActive, setApiActive] = useState([]);
  const [apiTrending, setApiTrending] = useState([]);
  const [apiALoading, setApiALoading] = useState(false);
  const [apiTLoading, setApiTLoading] = useState(false);
  const [apiAError, setApiAError] = useState('');
  const [apiTError, setApiTError] = useState('');
  const afDate = activeFunds?.[0]?.date || null;
  const isVideo = typeof heroSrc === 'string' && heroSrc.toLowerCase().endsWith('.mp4');
  const isLottie = typeof heroSrc === 'string' && heroSrc.includes('lottiefiles.com');
  const isDotLottie = typeof heroSrc === 'string' && heroSrc.toLowerCase().endsWith('.lottie');
  const playerRef = useRef(null);

  // Restart the Lottie animation every 5 seconds
  useEffect(() => {
    if (!isDotLottie || !playerRef.current) return;
    const el = playerRef.current;
    const id = setInterval(() => {
      try {
        el.stop?.();
        el.play?.();
      } catch (_) {}
    }, 5000);
    return () => clearInterval(id);
  }, [isDotLottie, heroSrc]);

  useEffect(() => {
    if (!isDotLottie || !playerRef.current) return;
    const el = playerRef.current;
    const selectWithRetry = async (attempt = 0) => {
      try {
        const manifest = (await el.getManifest?.()) || null;
        const animations = manifest?.animations || [];
        if (animations.length) {
          const id = animations[0].id;
          const current = el.getActiveAnimationId?.();
          if (!current || current !== id) {
            el.setAttribute?.('activeAnimationId', id);
            await el.setActiveAnimationId?.(id);
          }
          el.play?.();
          return;
        }
        // Fallback to a common default id
        el.setAttribute?.('activeAnimationId', 'default');
        await el.setActiveAnimationId?.('default');
        el.play?.();
      } catch (_) {
        // ignore and retry
      }
      if (attempt < 3) {
        setTimeout(() => selectWithRetry(attempt + 1), [100, 300, 800][attempt] || 800);
      }
    };

    const onReady = () => { selectWithRetry(0); };
    const onLoad = () => { selectWithRetry(0); };
    el.addEventListener?.('ready', onReady);
    el.addEventListener?.('load', onLoad);
    return () => {
      el.removeEventListener?.('ready', onReady);
      el.removeEventListener?.('load', onLoad);
    };
  }, [isDotLottie, heroSrc]);

  const retryLoad = async () => {
    setAfLoading(true);
    setAfError(null);
    setStaleData(false);
    try {
      const res = await fetch('/api/active-funds', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load active funds');
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.schemes || []);
      setActiveFunds(arr);
      try {
        localStorage.setItem('activeFundsCache', JSON.stringify({ at: Date.now(), data: arr }));
      } catch (_) {}
    } catch (e) {
      setAfError('Unable to load active funds right now');
    } finally {
      setAfLoading(false);
    }
  };

  const loadApiActive = async () => {
    setApiALoading(true);
    setApiAError('');
    try {
      const res = await fetch('/api/funds/active', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load active');
      const data = await res.json();
      setApiActive(Array.isArray(data) ? data : []);
    } catch (e) {
      setApiAError('Unable to load active funds from API');
    } finally {
      setApiALoading(false);
    }
  };

  const loadApiTrending = async () => {
    setApiTLoading(true);
    setApiTError('');
    try {
      const res = await fetch('/api/funds/trending', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load trending');
      const data = await res.json();
      setApiTrending(Array.isArray(data) ? data : []);
    } catch (e) {
      setApiTError('Unable to load trending funds from API');
    } finally {
      setApiTLoading(false);
    }
  };

  const addToWatchlist = async (w) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ schemeCode: w.schemeCode, schemeName: w.schemeName })
      });
      // Always also persist locally for immediate UI reflection
      try {
        const local = JSON.parse(localStorage.getItem('watchlistLocal') || '[]');
        const exists = local.some((it) => it.schemeCode === w.schemeCode);
        const next = exists ? local : [...local, { schemeCode: w.schemeCode, schemeName: w.schemeName }];
        localStorage.setItem('watchlistLocal', JSON.stringify(next));
      } catch (_) {}
      if (!res.ok) {
        setSnack({ open: true, msg: 'Saved locally (server unreachable)', severity: 'warning' });
        return;
      }
      setSnack({ open: true, msg: 'Added to watchlist', severity: 'success' });
    } catch (_) {
      try {
        const local = JSON.parse(localStorage.getItem('watchlistLocal') || '[]');
        const exists = local.some((it) => it.schemeCode === w.schemeCode);
        const next = exists ? local : [...local, { schemeCode: w.schemeCode, schemeName: w.schemeName }];
        localStorage.setItem('watchlistLocal', JSON.stringify(next));
        setSnack({ open: true, msg: 'Saved locally (server unreachable)', severity: 'warning' });
      } catch (e) {
        setSnack({ open: true, msg: 'Could not add to watchlist', severity: 'error' });
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box className="blur-fill" />
      <Script
        src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
        type="module"
        strategy="lazyOnload"
      />
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 6, md: 10 },
          position: 'relative',
          zIndex: 1,
          maxWidth: 'var(--max-width-page) !important'
        }}
      >
        <Snackbar
          open={snack.open}
          autoHideDuration={2000}
          onClose={() => setSnack({ ...snack, open: false })}
          message={snack.msg}
        />
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      letterSpacing: 6,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'var(--accent-teal)' 
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28
                      }}
                    >
                      <dotlottie-player
                        src="https://lottie.host/ca69f1cc-600b-4fd9-a4b6-17f12fd5d29c/1u1P7CN4J2.lottie"
                        autoplay
                        loop
                        background="transparent"
                        speed="1"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Box>
                    Intelligent Investing
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Typography 
                    variant="h1" 
                    className="heading-xl text-gradient"
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Grow wealth with confidence
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    className="body-lg"
                    sx={{ mb: 1 }}
                  >
                    Compare, analyze and plan mutual fund investments with modern tools and clean insights.
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="large" 
                        variant="contained" 
                        href="/funds"
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 3
                        }}
                      >
                        Explore Funds
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="large" 
                        variant="outlined" 
                        href="/compare"
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: 3
                        }}
                      >
                        Compare Funds
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ pt: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label="Zero commission" 
                      color="success" 
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 500 }}
                    />
                    <Chip 
                      label="SEBI/AMFI compliant" 
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 500 }}
                    />
                    <Chip 
                      label="Light/Dark Mode" 
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 500 }}
                    />
                  </Stack>
                </motion.div>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{ perspective: '1000px' }}
              >
                <Box sx={{ position: 'relative', aspectRatio: '16/10', maxWidth: 720, mx: 'auto' }}>
                  {/* Hero Animation */}
                  {isVideo ? (
                    <video
                      src={heroSrc}
                      muted
                      autoPlay
                      loop
                      playsInline
                      onError={() => setHeroSrc('https://psychological-coral-jdlpbjflaf.edgeone.app/hero-illustration%20(1)%20(2).png')}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', border: 'none' }}
                    />
                  ) : isLottie ? (
                    <>
                      <Script
                        src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
                        strategy="lazyOnload"
                      />
                      <lottie-player
                        key={heroSrc}
                        src={heroSrc}
                        autoplay
                        loop
                        mode="normal"
                        speed="1"
                        background="transparent"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    </>
                  ) : isDotLottie ? (
                    <>
                      <Script
                        src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
                        type="module"
                        strategy="lazyOnload"
                      />
                      <dotlottie-player
                        key={heroSrc}
                        ref={playerRef}
                        src={heroSrc}
                        autoplay
                        loop
                        renderer="svg"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                      />
                    </>
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.4s ease'
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 3,
                          py: 1.5,
                          borderRadius: 'var(--radius-2xl)',
                          border: '1px solid rgba(236, 72, 153, 0.35)',
                          background: 'rgba(236, 72, 153, 0.08)',
                          boxShadow: '0 12px 40px -18px rgba(236, 72, 153, 0.55)',
                          color: 'var(--gray-100)',
                          fontSize: '0.95rem',
                          fontWeight: 500
                        }}
                      >
                        <dotlottie-player
                          src="https://lottie.host/ca69f1cc-600b-4fd9-a4b6-17f12fd5d29c/1u1P7CN4J2.lottie"
                          autoplay
                          loop
                          background="transparent"
                          speed="1"
                          style={{ width: 40, height: 40 }}
                        />
                        Illuminating your investment journey…
                      </Box>
                    </Box>
                  )}
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        {/* Trust & credibility */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Card
            className="glass-card"
            sx={{
              borderRadius: 'var(--radius-2xl)',
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              bgcolor: 'transparent',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 55%)',
                opacity: 0.7,
                pointerEvents: 'none'
              }}
            />
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <Box className="floating-badge">
                    <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-blue))', boxShadow: '0 0 12px rgba(45,212,191,0.45)' }} />
                    Trusted by investors across India
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                    Built for discerning investors and financial advisors.
                  </Typography>
                  <Typography className="body-lg">
                    From detailed scheme analytics to proactive alerts, we provide a complete 360° suite to help you make smarter wealth decisions.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                    <Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>₹4.2 Cr+</Typography>
                      <Typography variant="body2" color="text.secondary">Portfolio value tracked</Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>12,500+</Typography>
                      <Typography variant="body2" color="text.secondary">Funds analyzed</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2.5} className="trust-logos">
                  {[
                    { 
                      title: 'AMFI Compliant', 
                      type: 'shield',
                      color: 'rgba(34, 197, 94, 0.15)',
                      iconColor: '#22c55e'
                    },
                    { 
                      title: 'Secure KYC', 
                      type: 'lock',
                      color: 'rgba(59, 130, 246, 0.15)',
                      iconColor: '#3b82f6'
                    },
                    { 
                      title: 'Data Encryption', 
                      type: 'encryption',
                      color: 'rgba(168, 85, 247, 0.15)',
                      iconColor: '#a855f7'
                    },
                    { 
                      title: 'Real-time NAV', 
                      type: 'realtime',
                      color: 'rgba(16, 185, 129, 0.15)',
                      iconColor: '#10b981'
                    }
                  ].map((item) => (
                    <Grid key={item.title} item xs={6} md={3}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(148, 163, 184, 0.28)',
                            bgcolor: item.color,
                            backdropFilter: 'blur(20px)',
                            p: 2,
                            height: 110,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: `${item.color}66`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 10px 25px ${item.iconColor}33`
                            }
                          }}
                        >
                          {/* Background glow effect */}
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background: `radial-gradient(circle at center, ${item.color}, transparent 70%)`,
                              opacity: 0.3,
                              pointerEvents: 'none'
                            }}
                          />
                          
                          {/* Animated SVG Icons */}
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              zIndex: 2,
                              '& svg': {
                                animation: 'float 3s ease-in-out infinite',
                                '@keyframes float': {
                                  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                                  '50%': { transform: 'translateY(-5px) rotate(2deg)' }
                                }
                              }
                            }}
                          >
                            {item.type === 'shield' && (
                              <motion.svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              >
                                <motion.path
                                  d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                                  fill={item.iconColor}
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                <motion.path
                                  d="M9 12L11 14L15 10"
                                  stroke="white"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                                />
                              </motion.svg>
                            )}
                            
                            {item.type === 'lock' && (
                              <motion.svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                              >
                                <motion.rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="10"
                                  rx="2"
                                  ry="2"
                                  fill={item.iconColor}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ duration: 0.4, delay: 0.3 }}
                                />
                                <motion.path
                                  d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11"
                                  stroke={item.iconColor}
                                  strokeWidth="2"
                                  fill="none"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                                />
                                <motion.circle
                                  cx="12"
                                  cy="16"
                                  r="2"
                                  fill="white"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.8 }}
                                />
                              </motion.svg>
                            )}
                            
                            {item.type === 'encryption' && (
                              <motion.svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <motion.rect
                                  x="2"
                                  y="6"
                                  width="20"
                                  height="12"
                                  rx="2"
                                  fill={item.iconColor}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                />
                                <motion.path
                                  d="M6 10L8 8L10 10"
                                  stroke="white"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.8, delay: 0.6 }}
                                />
                                <motion.path
                                  d="M14 10L16 8L18 10"
                                  stroke="white"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.8, delay: 0.8 }}
                                />
                                <motion.path
                                  d="M8 14H16"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.6, delay: 1 }}
                                />
                              </motion.svg>
                            )}
                            
                            {item.type === 'realtime' && (
                              <motion.svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                              >
                                <motion.circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke={item.iconColor}
                                  strokeWidth="2"
                                  fill="none"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                                <motion.path
                                  d="M12 6V12L16 14"
                                  stroke={item.iconColor}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                                <motion.path
                                  d="M8 2L10 4L8 6"
                                  stroke={item.iconColor}
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.6, delay: 1.2 }}
                                />
                                <motion.path
                                  d="M16 2L14 4L16 6"
                                  stroke={item.iconColor}
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.6, delay: 1.4 }}
                                />
                                {/* Pulsing dot for real-time effect */}
                                <motion.circle
                                  cx="12"
                                  cy="12"
                                  r="1"
                                  fill={item.iconColor}
                                  animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1] 
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: 2 
                                  }}
                                />
                              </motion.svg>
                            )}
                          </Box>
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 1.5, 
                            textAlign: 'center', 
                            display: 'block', 
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        >
                          {item.title}
                        </Typography>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* Feature highlights */}
        <Box sx={{ mt: { xs: 10, md: 14 } }}>
          <Stack spacing={1.5} sx={{ mb: 5 }}>
            <span className="section-heading">Platform advantages</span>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              A comprehensive toolkit for modern mutual fund investing
            </Typography>
            <Typography className="body-lg" sx={{ maxWidth: 620 }}>
              Seamlessly explore, evaluate and act on investment ideas with curated data stories, interactive visualizations and actionable insights that mirror top mutual fund platforms.
            </Typography>
          </Stack>
          <Grid container spacing={3.5}>
            {[
              {
                title: 'Hyper-detailed fund analytics',
                desc: 'Dive into rolling returns, drawdowns, volatility, risk ratios, SIP projections and peer benchmarking for every scheme.',
                badges: ['Advanced charts', 'Morningstar grades', 'Portfolio health']
              },
              {
                title: 'Intelligent investment workflows',
                desc: 'Create watchlists, set alerts, build goal-based portfolios and collaborate with clients through a holistic workspace.',
                badges: ['Smart watchlist', 'Goal planner', 'Advisor mode']
              },
              {
                title: 'Institution-grade monitoring',
                desc: 'Stay ahead with real-time AMC updates, sector news, rebalancing nudges and anomaly detection across all holdings.',
                badges: ['Daily signals', 'NAV compare', 'Sector exposure']
              }
            ].map((feature) => (
              <Grid key={feature.title} item xs={12} md={4}>
                <Card
                  className="glass-card"
                  sx={{
                    height: '100%',
                    borderRadius: 'var(--radius-xl)',
                    position: 'relative',
                    overflow: 'hidden',
                    px: 3,
                    py: 4
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.25), transparent 60%)',
                      opacity: 0.6,
                      pointerEvents: 'none'
                    }}
                  />
                  <Box sx={{ position: 'relative', height: 150, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {feature.title === 'Hyper-detailed fund analytics' && (
                      <motion.svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {/* Background circle */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="rgba(99, 102, 241, 0.1)"
                          stroke="rgba(99, 102, 241, 0.3)"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        
                        {/* Chart bars */}
                        {[30, 45, 65, 40, 55, 75, 50].map((height, i) => (
                          <motion.rect
                            key={i}
                            x={25 + i * 10}
                            y={90 - height}
                            width="6"
                            height={height}
                            rx="3"
                            fill={`hsl(${240 + i * 10}, 70%, ${60 + i * 5}%)`}
                            initial={{ scaleY: 0, y: 90 }}
                            animate={{ scaleY: 1, y: 90 - height }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                          />
                        ))}
                        
                        {/* Trend line */}
                        <motion.path
                          d="M25 75 L35 60 L45 45 L55 65 L65 50 L75 30 L85 40"
                          stroke="#10b981"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: 1.2, ease: "easeInOut" }}
                        />
                        
                        {/* Data points */}
                        {[[25, 75], [35, 60], [45, 45], [55, 65], [65, 50], [75, 30], [85, 40]].map(([x, y], i) => (
                          <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#10b981"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 1.4 + i * 0.1 }}
                          />
                        ))}
                        
                        {/* Floating stats */}
                        <motion.g
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 2 }}
                        >
                          <rect x="90" y="20" width="25" height="15" rx="3" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="1"/>
                          <text x="102" y="30" fontSize="8" fill="#ec4899" textAnchor="middle" fontWeight="600">+15%</text>
                        </motion.g>
                      </motion.svg>
                    )}
                    
                    {feature.title === 'Intelligent investment workflows' && (
                      <motion.svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {/* Background */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="rgba(168, 85, 247, 0.1)"
                          stroke="rgba(168, 85, 247, 0.3)"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        
                        {/* Central node */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="12"
                          fill="#a855f7"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        />
                        
                        {/* Workflow nodes */}
                        {[
                          { x: 60, y: 25, label: 'Goal', color: '#3b82f6' },
                          { x: 95, y: 60, label: 'Watch', color: '#10b981' },
                          { x: 60, y: 95, label: 'Alert', color: '#f59e0b' },
                          { x: 25, y: 60, label: 'Plan', color: '#ec4899' }
                        ].map((node, i) => (
                          <motion.g key={i}>
                            {/* Connection lines */}
                            <motion.line
                              x1="60"
                              y1="60"
                              x2={node.x}
                              y2={node.y}
                              stroke="rgba(168, 85, 247, 0.4)"
                              strokeWidth="2"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.6, delay: 0.6 + i * 0.2 }}
                            />
                            {/* Node circles */}
                            <motion.circle
                              cx={node.x}
                              cy={node.y}
                              r="8"
                              fill={node.color}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                            />
                            {/* Node labels */}
                            <motion.text
                              x={node.x}
                              y={node.y + (node.y < 60 ? -15 : node.y > 60 ? 20 : 0)}
                              fontSize="10"
                              fill={node.color}
                              textAnchor="middle"
                              fontWeight="600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 1.5 + i * 0.1 }}
                            >
                              {node.label}
                            </motion.text>
                          </motion.g>
                        ))}
                        
                        {/* Animated pulse */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="12"
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2"
                          animate={{
                            scale: [1, 1.67, 1],
                            opacity: [0.8, 0, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 2
                          }}
                        />
                      </motion.svg>
                    )}
                    
                    {feature.title === 'Institution-grade monitoring' && (
                      <motion.svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {/* Background */}
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="rgba(16, 185, 129, 0.1)"
                          stroke="rgba(16, 185, 129, 0.3)"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        
                        {/* Monitor screen */}
                        <motion.rect
                          x="35"
                          y="35"
                          width="50"
                          height="35"
                          rx="4"
                          fill="#1f2937"
                          stroke="#10b981"
                          strokeWidth="2"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        />
                        
                        {/* Screen content - real-time data */}
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                        >
                          {/* Data rows */}
                          {[42, 48, 54, 60].map((y, i) => (
                            <motion.line
                              key={i}
                              x1="38"
                              y1={y}
                              x2={75 - i * 5}
                              y2={y}
                              stroke="#10b981"
                              strokeWidth="1.5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.8, delay: 1 + i * 0.2 }}
                            />
                          ))}
                        </motion.g>
                        
                        {/* Live indicator */}
                        <motion.g>
                          <motion.circle
                            cx="77"
                            cy="40"
                            r="3"
                            fill="#ef4444"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.6, 1]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 1.5
                            }}
                          />
                          <motion.text
                            x="77"
                            y="50"
                            fontSize="6"
                            fill="#ef4444"
                            textAnchor="middle"
                            fontWeight="600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 1.8 }}
                          >
                            LIVE
                          </motion.text>
                        </motion.g>
                        
                        {/* Notification badges */}
                        {[
                          { x: 25, y: 25, color: '#f59e0b', count: '3' },
                          { x: 95, y: 25, color: '#ec4899', count: '7' },
                          { x: 25, y: 95, color: '#8b5cf6', count: '2' }
                        ].map((badge, i) => (
                          <motion.g key={i}>
                            <motion.circle
                              cx={badge.x}
                              cy={badge.y}
                              r="8"
                              fill={badge.color}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.4, delay: 2 + i * 0.2 }}
                            />
                            <motion.text
                              x={badge.x}
                              y={badge.y + 1}
                              fontSize="8"
                              fill="white"
                              textAnchor="middle"
                              fontWeight="700"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 2.2 + i * 0.2 }}
                            >
                              {badge.count}
                            </motion.text>
                          </motion.g>
                        ))}
                        
                        {/* Scanning line animation */}
                        <motion.line
                          x1="35"
                          y1="35"
                          x2="85"
                          y2="35"
                          stroke="#10b981"
                          strokeWidth="1"
                          opacity="0.7"
                          animate={{ 
                            opacity: [0.7, 0.3, 0.7],
                            strokeWidth: [1, 2, 1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: 2.5,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.svg>
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    {feature.desc}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                    {feature.badges.map((badge) => (
                      <Chip
                        key={badge}
                        label={badge}
                        variant="outlined"
                        sx={{ borderRadius: 3, borderColor: 'rgba(99, 102, 241, 0.35)', color: 'var(--foreground-strong)' }}
                      />
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Final CTA */}
        <Box sx={{ my: { xs: 10, md: 14 } }}>
          <Card
            className="glass-card"
            sx={{
              borderRadius: 'var(--radius-2xl)',
              position: 'relative',
              overflow: 'hidden',
              px: { xs: 4, md: 6 },
              py: { xs: 6, md: 7 }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at top right, rgba(99,102,241,0.28), transparent 60%)',
                opacity: 0.7,
                pointerEvents: 'none'
              }}
            />
            <Grid container spacing={5} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack spacing={2.5}>
                  <span className="section-heading">Ready to invest smarter?</span>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    Join thousands of investors who treat mutual funds like a pro desk.
                  </Typography>
                  <Typography className="body-lg">
                    Access premium research dashboards, stay notified with real-time portfolio intelligence and never miss a rebalancing cue again.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button 
                      size="large" 
                      variant="contained"
                      href="/compare"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      Launch fund comparator
                    </Button>
                    <Button 
                      size="large" 
                      variant="outlined"
                      href="/funds"
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.dark',
                          color: 'primary.dark',
                          bgcolor: 'rgba(99, 102, 241, 0.04)'
                        }
                      }}
                    >
                      View curated fund lists
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ position: 'relative', height: { xs: 220, md: 280 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.svg
                    width="280"
                    height="280"
                    viewBox="0 0 280 280"
                    fill="none"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Background gradient circle */}
                    <motion.circle
                      cx="140"
                      cy="140"
                      r="120"
                      fill="url(#ctaGradient)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <radialGradient id="ctaGradient" cx="0.3" cy="0.3">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
                        <stop offset="50%" stopColor="rgba(139, 92, 246, 0.15)" />
                        <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
                      </radialGradient>
                      <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    
                    {/* Central portfolio dashboard */}
                    <motion.g
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      {/* Main dashboard card */}
                      <motion.rect
                        x="90"
                        y="80"
                        width="100"
                        height="120"
                        rx="12"
                        fill="#1f2937"
                        stroke="url(#portfolioGradient)"
                        strokeWidth="2"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      />
                      
                      {/* Dashboard header */}
                      <motion.text
                        x="140"
                        y="100"
                        fontSize="12"
                        fill="url(#portfolioGradient)"
                        textAnchor="middle"
                        fontWeight="700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1.2 }}
                      >
                        Portfolio
                      </motion.text>
                      
                      {/* Portfolio value */}
                      <motion.text
                        x="140"
                        y="125"
                        fontSize="16"
                        fill="#10b981"
                        textAnchor="middle"
                        fontWeight="800"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.4 }}
                      >
                        ₹12,45,678
                      </motion.text>
                      
                      {/* Growth indicator */}
                      <motion.g
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 1.6 }}
                      >
                        <rect x="120" y="135" width="40" height="12" rx="6" fill="rgba(16, 185, 129, 0.2)" />
                        <text x="140" y="143" fontSize="8" fill="#10b981" textAnchor="middle" fontWeight="600">+24.3%</text>
                      </motion.g>
                      
                      {/* Mini charts */}
                      {[0, 1, 2].map((i) => (
                        <motion.g key={i}>
                          {/* Chart bars */}
                          {[8, 12, 15, 10, 18, 14].map((height, j) => (
                            <motion.rect
                              key={j}
                              x={95 + i * 30 + j * 4}
                              y={175 - height}
                              width="2"
                              height={height}
                              rx="1"
                              fill={`hsl(${200 + i * 60 + j * 10}, 70%, ${50 + j * 8}%)`}
                              initial={{ scaleY: 0, y: 175 }}
                              animate={{ scaleY: 1, y: 175 - height }}
                              transition={{ duration: 0.6, delay: 1.8 + i * 0.2 + j * 0.1 }}
                            />
                          ))}
                        </motion.g>
                      ))}
                    </motion.g>
                    
                    {/* Floating notification cards */}
                    {[
                      { x: 50, y: 60, title: 'Alert', desc: 'Rebalance due', color: '#f59e0b', delay: 2.2 },
                      { x: 210, y: 90, title: 'Update', desc: 'NAV +2.1%', color: '#10b981', delay: 2.4 },
                      { x: 60, y: 200, title: 'News', desc: 'Sector shift', color: '#ec4899', delay: 2.6 },
                      { x: 200, y: 210, title: 'Signal', desc: 'Buy opportunity', color: '#3b82f6', delay: 2.8 }
                    ].map((card, i) => (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: card.x - 20, y: card.y - 10 }}
                        animate={{ opacity: 1, scale: 1, x: card.x, y: card.y }}
                        transition={{ duration: 0.5, delay: card.delay }}
                      >
                        {/* Card background */}
                        <motion.rect
                          x={card.x - 25}
                          y={card.y - 15}
                          width="50"
                          height="30"
                          rx="8"
                          fill="rgba(31, 41, 55, 0.9)"
                          stroke={card.color}
                          strokeWidth="1.5"
                        />
                        
                        {/* Card content */}
                        <motion.text
                          x={card.x}
                          y={card.y - 5}
                          fontSize="8"
                          fill={card.color}
                          textAnchor="middle"
                          fontWeight="700"
                        >
                          {card.title}
                        </motion.text>
                        <motion.text
                          x={card.x}
                          y={card.y + 5}
                          fontSize="6"
                          fill="#9ca3af"
                          textAnchor="middle"
                        >
                          {card.desc}
                        </motion.text>
                        
                        {/* Notification dot */}
                        <motion.circle
                          cx={card.x + 18}
                          cy={card.y - 12}
                          r="3"
                          fill={card.color}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [1, 0.6, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: card.delay + 0.5
                          }}
                        />
                      </motion.g>
                    ))}
                    
                    {/* Connection lines between notifications and dashboard */}
                    {[
                      { from: [75, 75], to: [120, 120] },
                      { from: [210, 105], to: [160, 130] },
                      { from: [85, 185], to: [130, 170] },
                      { from: [175, 195], to: [150, 180] }
                    ].map((line, i) => (
                      <motion.line
                        key={i}
                        x1={line.from[0]}
                        y1={line.from[1]}
                        x2={line.to[0]}
                        y2={line.to[1]}
                        stroke="rgba(99, 102, 241, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 3 + i * 0.2 }}
                      />
                    ))}
                    
                    {/* Central pulsing effect */}
                    <motion.circle
                      cx="140"
                      cy="140"
                      r="60"
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.2)"
                      strokeWidth="2"
                      animate={{
                        scale: [1, 1.33, 1],
                        opacity: [0.4, 0, 0.4]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: 4
                      }}
                    />
                  </motion.svg>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}