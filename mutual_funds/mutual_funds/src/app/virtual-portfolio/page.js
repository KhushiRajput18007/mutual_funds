'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Chip, Button, CircularProgress, TextField, Stack } from '@mui/material';

export default function VirtualPortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ schemeCode: '', schemeName: '', sipAmount: '', dayOfMonth: 5 });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/virtual-portfolio');
    const data = await res.json();
    setItems(data || []);
    setLoading(false);
  };

  const save = async (e) => {
    e.preventDefault();
    await fetch('/api/virtual-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sipAmount: Number(form.sipAmount), dayOfMonth: Number(form.dayOfMonth) }) });
    setForm({ schemeCode: '', schemeName: '', sipAmount: '', dayOfMonth: 5 });
    await load();
  };

  const remove = async (schemeCode) => {
    await fetch('/api/virtual-portfolio', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeCode }) });
    await load();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Virtual Portfolio</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Simulate SIPs with virtual money and track over time.</Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Create Virtual SIP</Typography>
          <Box component="form" onSubmit={save}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
              <TextField label="Scheme Code" value={form.schemeCode} onChange={(e) => setForm({ ...form, schemeCode: e.target.value })} required fullWidth />
              <TextField label="Scheme Name" value={form.schemeName} onChange={(e) => setForm({ ...form, schemeName: e.target.value })} required fullWidth />
              <TextField label="SIP Amount (₹)" type="number" value={form.sipAmount} onChange={(e) => setForm({ ...form, sipAmount: e.target.value })} required />
              <TextField label="Day of Month" type="number" inputProps={{ min: 1, max: 28 }} value={form.dayOfMonth} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} required />
              <Button variant="contained" type="submit">Save</Button>
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
                  <Typography variant="body2" color="text.secondary">SIP: ₹{it.sipAmount} on day {it.dayOfMonth} each month</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
