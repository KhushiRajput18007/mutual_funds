'use client';

import { useState } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, Grid,
  CircularProgress, Box, Alert
} from '@mui/material';

export default function LumpsumCalculator({ schemeCode }) {
  const [lumpsumForm, setLumpsumForm] = useState({
    amount: 100000,
    from: '2020-01-01',
    to: '2023-12-31'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateLumpsum = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scheme/${schemeCode}/returns?from=${lumpsumForm.from}&to=${lumpsumForm.to}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      const currentValue = (lumpsumForm.amount * data.endNAV) / data.startNAV;
      const absoluteReturn = ((currentValue - lumpsumForm.amount) / lumpsumForm.amount) * 100;
      
      setResult({
        invested: lumpsumForm.amount,
        currentValue: currentValue,
        absoluteReturn: absoluteReturn,
        annualizedReturn: data.annualizedReturn
      });
    } catch (error) {
      setError('Failed to calculate lumpsum returns');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Lumpsum Investment Calculator
        </Typography>
        
        <Grid container spacing={2} style={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Investment Amount (₹)"
              type="number"
              value={lumpsumForm.amount}
              onChange={(e) => setLumpsumForm({...lumpsumForm, amount: parseInt(e.target.value)})}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Investment Date"
              type="date"
              value={lumpsumForm.from}
              onChange={(e) => setLumpsumForm({...lumpsumForm, from: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Exit Date"
              type="date"
              value={lumpsumForm.to}
              onChange={(e) => setLumpsumForm({...lumpsumForm, to: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={calculateLumpsum}
          disabled={loading}
          style={{ marginBottom: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Calculate Lumpsum Returns'}
        </Button>

        {error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}

        {result && (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Invested</Typography>
                <Typography variant="h6">₹{result.invested?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Current Value</Typography>
                <Typography variant="h6">₹{result.currentValue?.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Absolute Return</Typography>
                <Typography variant="h6" color={result.absoluteReturn >= 0 ? 'success.main' : 'error.main'}>
                  {result.absoluteReturn?.toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <Typography variant="body2" color="text.secondary">Annualized Return</Typography>
                <Typography variant="h6" color={result.annualizedReturn >= 0 ? 'success.main' : 'error.main'}>
                  {result.annualizedReturn?.toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}