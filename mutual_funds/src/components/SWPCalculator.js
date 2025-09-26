'use client';

import { useState } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Grid,
  CircularProgress, Box, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

export default function SWPCalculator({ schemeCode }) {
  const [swpForm, setSwpForm] = useState({
    initialInvestment: 1000000,
    withdrawalAmount: 10000,
    frequency: 'monthly',
    from: '2020-01-01',
    to: '2023-12-31'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateSWP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scheme/${schemeCode}`);
      const schemeData = await response.json();
      
      if (!schemeData.data) {
        setError('Unable to fetch scheme data');
        return;
      }
      
      const navData = schemeData.data;
      const start = new Date(swpForm.from);
      const end = new Date(swpForm.to);
      
      let initialNAV = null;
      for (const entry of navData) {
        const entryDate = new Date(entry.date);
        if (entryDate <= start && (!initialNAV || entryDate > new Date(initialNAV.date))) {
          initialNAV = entry;
        }
      }
      
      if (!initialNAV) {
        setError('No NAV data available for start date');
        return;
      }
      
      let remainingUnits = swpForm.initialInvestment / parseFloat(initialNAV.nav);
      let totalWithdrawn = 0;
      const withdrawals = [];
      
      const withdrawalDates = [];
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        withdrawalDates.push(new Date(currentDate));
        
        if (swpForm.frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (swpForm.frequency === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (swpForm.frequency === 'yearly') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
      
      for (const withdrawalDate of withdrawalDates) {
        if (remainingUnits <= 0) break;
        
        let navForDate = null;
        for (const entry of navData) {
          const entryDate = new Date(entry.date);
          if (entryDate <= withdrawalDate && parseFloat(entry.nav) > 0) {
            if (!navForDate || entryDate > new Date(navForDate.date)) {
              navForDate = entry;
            }
          }
        }
        
        if (navForDate) {
          const unitsToRedeem = swpForm.withdrawalAmount / parseFloat(navForDate.nav);
          const actualUnitsRedeemed = Math.min(unitsToRedeem, remainingUnits);
          const actualWithdrawal = actualUnitsRedeemed * parseFloat(navForDate.nav);
          
          remainingUnits -= actualUnitsRedeemed;
          totalWithdrawn += actualWithdrawal;
          
          withdrawals.push({
            date: withdrawalDate.toISOString().split('T')[0],
            nav: parseFloat(navForDate.nav),
            unitsRedeemed: actualUnitsRedeemed,
            amount: actualWithdrawal
          });
        }
      }
      
      let finalNAV = null;
      for (const entry of navData) {
        if (!finalNAV || new Date(entry.date) > new Date(finalNAV.date)) {
          finalNAV = entry;
        }
      }
      
      const remainingValue = remainingUnits * parseFloat(finalNAV.nav);
      const totalValue = totalWithdrawn + remainingValue;
      
      setResult({
        initialInvestment: swpForm.initialInvestment,
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        remainingValue: parseFloat(remainingValue.toFixed(2)),
        remainingUnits: parseFloat(remainingUnits.toFixed(4)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        withdrawals: withdrawals.length,
        avgWithdrawal: withdrawals.length > 0 ? parseFloat((totalWithdrawn / withdrawals.length).toFixed(2)) : 0
      });
      
    } catch (error) {
      setError('Failed to calculate SWP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          SWP (Systematic Withdrawal Plan) Calculator
        </Typography>
        
        <Grid container spacing={2} style={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Initial Investment (₹)"
              type="number"
              value={swpForm.initialInvestment}
              onChange={(e) => setSwpForm({...swpForm, initialInvestment: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Withdrawal Amount (₹)"
              type="number"
              value={swpForm.withdrawalAmount}
              onChange={(e) => setSwpForm({...swpForm, withdrawalAmount: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={swpForm.frequency}
                label="Frequency"
                onChange={(e) => setSwpForm({...swpForm, frequency: e.target.value})}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={swpForm.from}
              onChange={(e) => setSwpForm({...swpForm, from: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={swpForm.to}
              onChange={(e) => setSwpForm({...swpForm, to: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={calculateSWP}
          disabled={loading}
          style={{ marginBottom: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Calculate SWP'}
        </Button>

        {error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

        {result && (
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Initial Investment</Typography>
                <Typography variant="h6">₹{result.initialInvestment?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Total Withdrawn</Typography>
                <Typography variant="h6">₹{result.totalWithdrawn?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Remaining Value</Typography>
                <Typography variant="h6">₹{result.remainingValue?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Total Value</Typography>
                <Typography variant="h6">₹{result.totalValue?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Withdrawals</Typography>
                <Typography variant="h6">{result.withdrawals}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Avg Withdrawal</Typography>
                <Typography variant="h6">₹{result.avgWithdrawal?.toLocaleString()}</Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}