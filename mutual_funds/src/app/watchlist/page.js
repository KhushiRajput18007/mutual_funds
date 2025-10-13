'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Button, CircularProgress, TextField, Stack } from '@mui/material';

const PERIODS = [
  { key: '1d', label: '1D' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: '1y', label: '1Y' },
];

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ schemeCode: '', schemeName: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/watchlist', { cache: 'no-store' });
    let data;
    try {
      data = await res.json();
    } catch (_) {
      data = [];
    }
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : [];
    // Merge with locally saved bookmarks
    let merged = list;
    try {
      const local = JSON.parse(localStorage.getItem('watchlistLocal') || '[]');
      if (Array.isArray(local) && local.length) {
        const byCode = new Map(list.map((it) => [it.schemeCode, it]));
        for (const l of local) {
          if (!byCode.has(l.schemeCode)) byCode.set(l.schemeCode, l);
        }
        merged = Array.from(byCode.values());
      }
    } catch (_) {}

    // For each item, fetch returns for durations (except 1D which needs latest vs previous day)
    const enriched = await Promise.all(
      merged.map(async (w) => {
        const base = { ...w, returns: {} };
        const periods = ['1m', '3m', '6m', '1y'];
        for (const p of periods) {
          try {
            const r = await fetch(`/api/scheme/${w.schemeCode}/returns?period=${p}`);
            const j = await r.json();
            base.returns[p] = j?.simpleReturn ?? null;
          } catch (_) {}
        }
        // 1D: compare latest two NAVs
        try {
          const sres = await fetch(`/api/scheme/${w.schemeCode}`);
          const sdata = await sres.json();
          const arr = sdata?.data || [];
          if (arr.length >= 2) {
            const today = parseFloat(arr[0].nav);
            const prev = parseFloat(arr[1].nav);
            base.returns['1d'] = ((today - prev) / prev) * 100;
          } else {
            base.returns['1d'] = null;
          }
        } catch (_) { base.returns['1d'] = null; }
        return base;
      })
    );

    setItems(enriched);
    setLoading(false);
  };

  const add = async (e) => {
    e.preventDefault();
    if (!form.schemeCode || !form.schemeName) return;
    await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' }, body: JSON.stringify(form) });
    try {
      const local = JSON.parse(localStorage.getItem('watchlistLocal') || '[]');
      const exists = local.some((it) => it.schemeCode === form.schemeCode);
      const next = exists ? local : [...local, { schemeCode: form.schemeCode, schemeName: form.schemeName }];
      localStorage.setItem('watchlistLocal', JSON.stringify(next));
    } catch (_) {}
    setForm({ schemeCode: '', schemeName: '' });
    await load();
  };

  const remove = async (schemeCode) => {
    await fetch('/api/watchlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' }, body: JSON.stringify({ schemeCode }) });
    try {
      const local = JSON.parse(localStorage.getItem('watchlistLocal') || '[]');
      const next = Array.isArray(local) ? local.filter((it) => it.schemeCode !== schemeCode) : [];
      localStorage.setItem('watchlistLocal', JSON.stringify(next));
    } catch (_) {}
    await load();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Watchlist</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Track performance quickly across multiple durations.</Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Add to Watchlist</Typography>
          <Box component="form" onSubmit={add}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
              <TextField label="Scheme Code" value={form.schemeCode} onChange={(e) => setForm({ ...form, schemeCode: e.target.value })} required fullWidth />
              <TextField label="Scheme Name" value={form.schemeName} onChange={(e) => setForm({ ...form, schemeName: e.target.value })} required fullWidth />
              <Button variant="contained" type="submit">Add</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
      {loading ? (
        <Box textAlign="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((it) => (
            <Grid item xs={12} md={6} lg={4} key={it.schemeCode}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{it.schemeName}</Typography>
                      <Chip size="small" label={it.schemeCode} sx={{ mt: 0.5 }} />
                    </Box>
                    <Button size="small" color="error" onClick={() => remove(it.schemeCode)}>Remove</Button>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {PERIODS.map((p) => {
                      const val = it.returns[p.key?.toLowerCase?.() || p.key];
                      const color = val == null ? 'default' : val >= 0 ? 'success' : 'error';
                      const label = val == null ? `${p.label}: N/A` : `${p.label}: ${val.toFixed(2)}%`;
                      return <Chip key={p.key} label={label} color={color} variant="outlined" />;
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
