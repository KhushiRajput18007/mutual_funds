'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Grid,
  CircularProgress, Box, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    if (swpForm.initialInvestment > 0 && swpForm.withdrawalAmount > 0) {
      calculateSWP();
    }
  }, [swpForm.initialInvestment, swpForm.withdrawalAmount, swpForm.frequency, swpForm.from, swpForm.to]);

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
        avgWithdrawal: withdrawals.length > 0 ? parseFloat((totalWithdrawn / withdrawals.length).toFixed(2)) : 0,
        withdrawalData: withdrawals
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
          <>
            <Typography variant="h6" gutterBottom style={{ marginTop: '24px', marginBottom: '16px', color: '#1976d2' }}>
              SWP Results
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: '32px' }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Initial Investment</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.initialInvestment?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Withdrawn</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.totalWithdrawn?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Remaining Value</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.remainingValue?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Value</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.totalValue?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Withdrawals</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>{result.withdrawals}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #00796b 0%, #4db6ac 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Avg Withdrawal</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.avgWithdrawal?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Card elevation={2} style={{ padding: '24px', marginTop: '16px' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#1976d2', marginBottom: '20px' }}>SWP Withdrawal Pattern</Typography>
              <Box style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={result.withdrawalData?.map((withdrawal, index) => {
                  const cumulativeWithdrawn = result.withdrawalData.slice(0, index + 1).reduce((sum, w) => sum + w.amount, 0);
                  const remainingValue = result.initialInvestment - cumulativeWithdrawn;
                  return {
                    date: withdrawal.date,
                    withdrawn: withdrawal.amount,
                    cumulativeWithdrawn,
                    remainingValue: Math.max(0, remainingValue)
                  };
                }) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="withdrawn" stroke="#ff7300" strokeWidth={2} name="Withdrawal Amount" />
                  <Line type="monotone" dataKey="cumulativeWithdrawn" stroke="#8884d8" strokeWidth={2} name="Cumulative Withdrawn" />
                  <Line type="monotone" dataKey="remainingValue" stroke="#1976d2" strokeWidth={2} name="Remaining Value" />
                </LineChart>
              </ResponsiveContainer>
              </Box>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}