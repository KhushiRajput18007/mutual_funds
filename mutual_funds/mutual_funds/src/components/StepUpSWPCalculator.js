'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Grid,
  CircularProgress, Box, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

export default function StepUpSWPCalculator({ schemeCode }) {
  const [swpForm, setSwpForm] = useState({
    initialInvestment: 1000000,
    withdrawalAmount: 10000,
    frequency: 'monthly',
    from: '2020-01-01',
    to: '2023-12-31',
    step_up_percentage: 5
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (swpForm.initialInvestment > 0 && swpForm.withdrawalAmount > 0) {
      calculateStepUpSWP();
    }
  }, [swpForm.initialInvestment, swpForm.withdrawalAmount, swpForm.frequency, swpForm.from, swpForm.to, swpForm.step_up_percentage]);

  const calculateStepUpSWP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scheme/${schemeCode}/stepup-swp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swpForm)
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (error) {
      setError('Failed to calculate step-up SWP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Step-up SWP Calculator
        </Typography>
        
        <Grid container spacing={2} style={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Initial Investment (₹)"
              type="number"
              value={swpForm.initialInvestment}
              onChange={(e) => setSwpForm({...swpForm, initialInvestment: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Initial Withdrawal (₹)"
              type="number"
              value={swpForm.withdrawalAmount}
              onChange={(e) => setSwpForm({...swpForm, withdrawalAmount: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Step-up %"
              type="number"
              value={swpForm.step_up_percentage}
              onChange={(e) => setSwpForm({...swpForm, step_up_percentage: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
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
          <Grid item xs={12} md={1.75}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={swpForm.from}
              onChange={(e) => setSwpForm({...swpForm, from: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.75}>
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
          onClick={calculateStepUpSWP}
          disabled={loading}
          style={{ marginBottom: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Calculate Step-up SWP'}
        </Button>

        {error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

        {result && (
          <>
            <Typography variant="h6" gutterBottom style={{ marginTop: '24px', marginBottom: '16px', color: '#1976d2' }}>
              Step-up SWP Results
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: '32px' }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Initial Investment</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.initialInvestment?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Withdrawn</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.totalWithdrawn?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Remaining Value</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.remainingValue?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Value</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.totalValue?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
}