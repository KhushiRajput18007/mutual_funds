'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Grid,
  CircularProgress, Box, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StepUpSIPCalculator({ schemeCode }) {
  const [sipForm, setSipForm] = useState({
    amount: 5000,
    frequency: 'monthly',
    from: '2020-01-01',
    to: '2023-12-31',
    step_up_percentage: 10
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sipForm.amount > 0) {
      calculateStepUpSIP();
    }
  }, [sipForm.amount, sipForm.frequency, sipForm.from, sipForm.to, sipForm.step_up_percentage]);

  const calculateStepUpSIP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scheme/${schemeCode}/stepup-sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sipForm)
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (error) {
      setError('Failed to calculate step-up SIP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Step-up SIP Calculator
        </Typography>
        
        <Grid container spacing={2} style={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Initial SIP Amount (₹)"
              type="number"
              value={sipForm.amount}
              onChange={(e) => setSipForm({...sipForm, amount: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Step-up %"
              type="number"
              value={sipForm.step_up_percentage}
              onChange={(e) => setSipForm({...sipForm, step_up_percentage: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={sipForm.frequency}
                label="Frequency"
                onChange={(e) => setSipForm({...sipForm, frequency: e.target.value})}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={sipForm.from}
              onChange={(e) => setSipForm({...sipForm, from: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={sipForm.to}
              onChange={(e) => setSipForm({...sipForm, to: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={calculateStepUpSIP}
          disabled={loading}
          style={{ marginBottom: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Calculate Step-up SIP'}
        </Button>

        {error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

        {result && (
          <>
            <Typography variant="h6" gutterBottom style={{ marginTop: '24px', marginBottom: '16px', color: '#1976d2' }}>
              Step-up SIP Results
            </Typography>
            <Grid container spacing={3} style={{ marginBottom: '32px' }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Invested</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.totalInvested?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Current Value</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{result.currentValue?.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: result.absoluteReturn >= 0 ? 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Absolute Return</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>{result.absoluteReturn?.toFixed(2)}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={3} style={{ background: result.annualizedReturn >= 0 ? 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
                  <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Annualized Return</Typography>
                    <Typography variant="h5" style={{ fontWeight: 'bold' }}>{result.annualizedReturn?.toFixed(2)}%</Typography>
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