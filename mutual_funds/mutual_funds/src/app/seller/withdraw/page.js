"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent, Grid, Divider, Snackbar, Alert } from '@mui/material';

const currency = (n) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function SellerWithdrawPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [availableData, setAvailableData] = useState(null);
  const [history, setHistory] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qUser = params.get('userId');
    const saved = localStorage.getItem('sellerUserId');
    const v = qUser || saved || '';
    if (v) setUserId(v);
  }, []);

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [aRes, hRes] = await Promise.all([
        fetch(`/api/seller/commissions/available?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/commissions/withdraw?role=seller&userId=${encodeURIComponent(userId)}`),
      ]);
      const [aJson, hJson] = await Promise.all([aRes.json(), hRes.json()]);
      setAvailableData(aJson?.data || null);
      setHistory(hJson?.data || null);
      localStorage.setItem('sellerUserId', userId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawAll = async () => {
    if (!userId) return;
    setWithdrawing(true);
    try {
      const res = await fetch('/api/commissions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'seller', userId })
      });
      const json = await res.json();
      if (json?.success) {
        setToast({ open: true, message: json.message, severity: 'success' });
        await fetchData();
      } else {
        setToast({ open: true, message: json?.error || 'Withdrawal failed', severity: 'error' });
      }
    } catch (e) {
      console.error(e);
      setToast({ open: true, message: 'Withdrawal failed', severity: 'error' });
    } finally {
      setWithdrawing(false);
    }
  };

  const availableAmount = availableData?.totalAvailable || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Seller Withdrawal</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Seller User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" onClick={fetchData} disabled={loading || !userId}>Load</Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button color="success" variant="contained" onClick={handleWithdrawAll} disabled={withdrawing || !userId || availableAmount <= 0}>
                {withdrawing ? 'Withdrawing...' : 'Withdraw Now'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Available (Day 5+)</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" color="success.main" gutterBottom>{currency(availableAmount)}</Typography>
              {(availableData?.groupedByDate || []).map((g, idx) => (
                <Box key={idx} mb={2}>
                  <Typography fontWeight={600}>{g.withdrawalDate ? new Date(g.withdrawalDate).toDateString() : 'No date'}</Typography>
                  <Typography color="text.secondary">{g.commissions?.length || 0} records • {currency(g.totalAmount)}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Withdrawal History</Typography>
              <Divider sx={{ mb: 2 }} />
              {(history?.withdrawals || []).map((w) => (
                <Box key={w._id} mb={2}>
                  <Typography fontWeight={600}>{w.period.month}/{w.period.year} • {currency(w.breakdown?.seller || 0)}</Typography>
                  <Typography color="text.secondary">Portfolio: {currency(w.portfolioValue)}</Typography>
                </Box>
              ))}
              {(!history || (history?.withdrawals || []).length === 0) && (
                <Typography color="text.secondary">No withdrawals yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
