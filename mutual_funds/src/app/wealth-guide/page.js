'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Stack, Grid, Button, Chip, Card, CardContent, CircularProgress, Alert, IconButton, Tooltip, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';

export default function WealthGuidePage() {
  const [heroSrc, setHeroSrc] = useState('https://reasonable-harlequin-ex4bber2my.edgeone.app/hero-illustration%20(1)%20(1).png');
  const [activeFunds, setActiveFunds] = useState([]);
  const [afLoading, setAfLoading] = useState(true);
  const [afError, setAfError] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const afDate = activeFunds?.[0]?.date || null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setAfLoading(true);
      setAfError(null);
      try {
        const res = await fetch('/api/active-funds', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load active funds');
        const json = await res.json();
        if (!cancelled) setActiveFunds(Array.isArray(json) ? json : (json.schemes || []));
      } catch (e) {
        if (!cancelled) setAfError('Unable to load active funds right now');
      } finally {
        if (!cancelled) setAfLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

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
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <Snackbar
          open={snack.open}
          autoHideDuration={2000}
          onClose={() => setSnack({ ...snack, open: false })}
          message={snack.msg}
        />
        {/* Hero */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.2 }}>Smart Investing</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Grow wealth with confidence
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Compare, analyze and plan mutual fund investments with modern tools and clean insights.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                <Button size="large" variant="contained" href="/funds">Explore Funds</Button>
                <Button size="large" variant="outlined" href="/compare">Compare Funds</Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                <Chip label="Zero commission" color="success" variant="outlined" />
                <Chip label="SEBI/AMFI compliant" variant="outlined" />
                <Chip label="Light/Dark" variant="outlined" />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', aspectRatio: '16/10', borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper', border: (t) => `1px solid ${t.palette.divider}` }}>
              {/* HERO IMAGE PLACEHOLDER */}
              <Image
                src={heroSrc}
                alt="Hero visual"
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Trust Logos / Metrics */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid key={i} item xs={6} sm={4} md={2}>
                <Box sx={{ height: 40, position: 'relative', opacity: 0.7 }}>
                  {/* TRUST LOGO PLACEHOLDER */}
                  <Image src={`/wealth-guide/trust-logo-${i}.svg`} alt={`Logo ${i}`} fill style={{ objectFit: 'contain' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Active Funds (today) */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="overline" color="primary">{afDate ? `Active on ${afDate}` : 'Active (previous day)'}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Trending active funds</Typography>
            <Typography variant="body2" color="text.secondary">Based on yesterday&apos;s snapshot</Typography>
          </Stack>

          {afLoading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : afError ? (
            <Alert severity="warning">{afError}</Alert>
          ) : activeFunds.length === 0 ? (
            <Alert severity="info">No active funds available for today.</Alert>
          ) : (
            <Grid container spacing={2}>
              {activeFunds.slice(0, 8).map((f) => (
                <Grid key={`${f.schemeCode}-${f.date || ''}`} item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {f.schemeName?.length > 52 ? `${f.schemeName.slice(0, 52)}...` : f.schemeName}
                        </Typography>
                        <Tooltip title="Add to Watchlist">
                          <IconButton size="small" aria-label="add-to-watchlist" onClick={() => addToWatchlist(f)}>
                            <BookmarkAddOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {f.fundHouse || f.category || '—'}
                      </Typography>
                      {typeof f.latestNAV === 'number' && (
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          ₹{f.latestNAV.toFixed(2)} NAV
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Features */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" color="primary">Why choose us</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Everything you need to invest smarter</Typography>
          </Stack>
          <Grid container spacing={3}>
            {[
              { title: 'Compare any funds', desc: 'Side-by-side comparisons for returns, risk, expense ratio, AUM and more.', img: '/wealth-guide/feature-compare.svg' },
              { title: 'Powerful SIP tools', desc: 'Plan SIPs, step-ups and visualize outcomes with interactive charts.', img: '/wealth-guide/feature-sip.svg' },
              { title: 'Curated categories', desc: 'Discover Large/Mid/Small Cap, ELSS, Index, Debt and thematic ideas.', img: '/wealth-guide/feature-categories.svg' },
            ].map((f) => (
              <Grid key={f.title} item xs={12} md={4}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ position: 'relative', height: 140, mb: 2, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', border: (t) => `1px solid ${t.palette.divider}` }}>
                      {/* FEATURE IMAGE PLACEHOLDER */}
                      <Image src={f.img} alt={f.title} fill style={{ objectFit: 'cover' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How it works */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" color="primary">Get started in minutes</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Simple steps to start investing</Typography>
          </Stack>
          <Grid container spacing={3}>
            {[
              { step: '01', title: 'Explore funds', img: '/wealth-guide/step-1.svg' },
              { step: '02', title: 'Compare & shortlist', img: '/wealth-guide/step-2.svg' },
              { step: '03', title: 'Plan SIP & track', img: '/wealth-guide/step-3.svg' },
            ].map((s) => (
              <Grid key={s.step} item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <Chip label={s.step} color="primary" variant="outlined" sx={{ width: 72 }} />
                  <Box sx={{ position: 'relative', height: 160, borderRadius: 2, overflow: 'hidden', bgcolor: 'background.default', border: (t) => `1px solid ${t.palette.divider}` }}>
                    {/* STEP IMAGE PLACEHOLDER */}
                    <Image src={s.img} alt={s.title} fill style={{ objectFit: 'cover' }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.title}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Categories */}
        <Box sx={{ mt: { xs: 8, md: 12 } }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="overline" color="primary">Popular categories</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Discover by investment style</Typography>
          </Stack>
          <Grid container spacing={2}>
            {[
              { label: 'Large Cap', href: '/funds?search=large%20cap' },
              { label: 'Mid Cap', href: '/funds?search=mid%20cap' },
              { label: 'Small Cap', href: '/funds?search=small%20cap' },
              { label: 'ELSS (Tax Saving)', href: '/funds?search=elss' },
              { label: 'Debt Funds', href: '/funds?search=debt' },
              { label: 'Index Funds', href: '/funds?search=index' },
            ].map((c) => (
              <Grid key={c.label} item xs={6} sm={4} md={2}>
                <Button fullWidth variant="outlined" href={c.href} sx={{ borderRadius: 3 }}>{c.label}</Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ my: { xs: 8, md: 12 } }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Ready to explore smarter?</Typography>
                  <Typography variant="body1" color="text.secondary">Start comparing funds or plan a SIP in minutes.</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ md: 'flex-end' }}>
                    <Button variant="contained" href="/compare">Compare Funds</Button>
                    <Button variant="outlined" href="/funds">Explore Funds</Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
