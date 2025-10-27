"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, TextField, Button, Card, CardContent, Grid, Chip, Divider } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const currency = (n) => `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function SellerCommissionsPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [availableData, setAvailableData] = useState(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sellerUserId') : '';
    if (saved) setUserId(saved);
  }, []);

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`/api/seller/commissions/monthly?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/seller/commissions/available?userId=${encodeURIComponent(userId)}`),
      ]);
      const [mJson, aJson] = await Promise.all([mRes.json(), aRes.json()]);
      setMonthlyData(mJson?.data || null);
      setAvailableData(aJson?.data || null);
      localStorage.setItem('sellerUserId', userId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const trendChartData = useMemo(() => {
    const trends = monthlyData?.trends || [];
    const labels = trends.map(t => `${t.period.month}/${t.period.year}`);
    return {
      labels: labels.reverse(),
      datasets: [
        {
          label: 'Monthly Earnings (Seller)',
          data: trends.map(t => t.userShare).reverse(),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25,118,210,0.2)'
        }
      ]
    };
  }, [monthlyData]);

  const currentMonthEarnings = monthlyData?.summary?.currentMonth || 0;
  const availableAmount = availableData?.totalAvailable || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h5" fontWeight={700}>Seller Commissions</Typography>
        <Chip color="primary" label={`Current Month: ${currency(currentMonthEarnings)}`} />
        <Chip color="success" label={`Available (Day 5+): ${currency(availableAmount)}`} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth label="Seller User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" onClick={fetchData} disabled={loading || !userId}>Load Data</Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" href={`/seller/withdraw?userId=${encodeURIComponent(userId)}`} disabled={!userId}>Go to Withdraw</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Monthly Earnings Trend</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 320 }}>
                <Line data={trendChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="grid" gridTemplateColumns="1fr 1fr" rowGap={1.5} columnGap={2}>
                <Typography color="text.secondary">Current Month</Typography>
                <Typography align="right">{currency(currentMonthEarnings)}</Typography>

                <Typography color="text.secondary">Total Historical (Seller)</Typography>
                <Typography align="right">{currency(monthlyData?.summary?.totalHistorical)}</Typography>

                <Typography color="text.secondary">Records</Typography>
                <Typography align="right">{monthlyData?.summary?.recordCount || 0}</Typography>

                <Typography color="text.secondary">Available to Withdraw</Typography>
                <Typography align="right">{currency(availableAmount)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Available Commissions (by Date)</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {(availableData?.groupedByDate || []).map((g) => (
                <Grid item xs={12} md={6} key={g.withdrawalDate || Math.random()}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography fontWeight={600} gutterBottom>
                        {g.withdrawalDate ? new Date(g.withdrawalDate).toDateString() : 'No date'}
                      </Typography>
                      <Typography color="text.secondary">Total: {currency(g.totalAmount)}</Typography>
                      <Typography color="text.secondary">Records: {g.commissions?.length || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {(!availableData || (availableData?.groupedByDate || []).length === 0) && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">No available commissions yet. Data is marked available on Day 5.</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
