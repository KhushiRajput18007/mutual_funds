'use client';

import { useState, useEffect, use } from 'react';
import {
  Typography, Box, Card, CardContent, Grid, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Alert
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subYears } from 'date-fns';
import LumpsumCalculator from '../../../components/LumpsumCalculator';
import SWPCalculator from '../../../components/SWPCalculator';
import StepUpSIPCalculator from '../../../components/StepUpSIPCalculator';
import StepUpSWPCalculator from '../../../components/StepUpSWPCalculator';

export default function SchemeDetailPage({ params }) {
  const { code } = use(params);
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState({});
  const [sipResult, setSipResult] = useState(null);
  const [sipLoading, setSipLoading] = useState(false);
  const [sipForm, setSipForm] = useState({
    amount: 5000,
    frequency: 'monthly',
    from: format(subYears(new Date(), 3), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchSchemeData();
    fetchReturns();
  }, [code]);

  const fetchSchemeData = async () => {
    try {
      const response = await fetch(`/api/scheme/${code}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSchemeData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheme data:', error);
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    const periods = ['1m', '3m', '6m', '1y'];
    const returnsData = {};
    
    for (const period of periods) {
      try {
        const response = await fetch(`/api/scheme/${code}/returns?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.error) {
            returnsData[period] = data;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${period} returns:`, error);
      }
    }
    
    setReturns(returnsData);
  };

  const calculateSIP = async () => {
    setSipLoading(true);
    try {
      console.log('SIP Form Data:', sipForm);
      console.log('Scheme Code:', code);
      
      const response = await fetch(`/api/scheme/${code}/sip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sipForm),
      });
      
      console.log('SIP Response Status:', response.status);
      const data = await response.json();
      console.log('SIP Response Data:', data);
      
      if (data.error) {
        console.error('SIP API Error:', data.error);
        alert('Error: ' + data.error);
      } else {
        console.log('SIP Result:', data);
        setSipResult(data);
      }
    } catch (error) {
      console.error('Error calculating SIP:', error);
      alert('Failed to calculate SIP: ' + error.message);
    }
    setSipLoading(false);
  };

  const getChartData = () => {
    if (!schemeData?.data) return [];
    
    return schemeData.data
      .slice(-365)
      .map(item => {
        const date = new Date(item.date);
        return {
          date: item.date,
          nav: parseFloat(item.nav),
          formattedDate: isNaN(date.getTime()) ? item.date : format(date, 'MMM dd')
        };
      })
      .reverse();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!schemeData?.meta) {
    return <Alert severity="error">Scheme not found or failed to load data from MFAPI.in</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {schemeData.meta.scheme_name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Scheme Information</Typography>
              <Box style={{ marginBottom: '16px' }}>
                <Typography variant="body2" color="text.secondary">Fund House</Typography>
                <Typography variant="body1">{schemeData.meta.fund_house}</Typography>
              </Box>
              <Box style={{ marginBottom: '16px' }}>
                <Typography variant="body2" color="text.secondary">Scheme Type</Typography>
                <Typography variant="body1">{schemeData.meta.scheme_type}</Typography>
              </Box>
              <Box style={{ marginBottom: '16px' }}>
                <Typography variant="body2" color="text.secondary">Scheme Category</Typography>
                <Typography variant="body1">{schemeData.meta.scheme_category}</Typography>
              </Box>
              <Chip label={`Code: ${schemeData.meta.scheme_code}`} color="primary" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Returns</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Simple Return (%)</TableCell>
                      <TableCell align="right">Annualized Return (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(returns).map(([period, data]) => (
                      <TableRow key={period}>
                        <TableCell>{period.toUpperCase()}</TableCell>
                        <TableCell align="right">
                          {data.simpleReturn ? `${data.simpleReturn}%` : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {data.annualizedReturn ? `${data.annualizedReturn}%` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>NAV Chart (Last 1 Year)</Typography>
              <Box style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="nav" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <LumpsumCalculator schemeCode={code} />
        </Grid>

        <Grid item xs={12}>
          <SWPCalculator schemeCode={code} />
        </Grid>

        <Grid item xs={12}>
          <StepUpSIPCalculator schemeCode={code} />
        </Grid>

        <Grid item xs={12}>
          <StepUpSWPCalculator schemeCode={code} />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>SIP Calculator</Typography>
              
              <Grid container spacing={3} style={{ marginBottom: '24px' }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="SIP Amount (₹)"
                    type="number"
                    value={sipForm.amount}
                    onChange={(e) => setSipForm({...sipForm, amount: parseInt(e.target.value)})}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={sipForm.from}
                    onChange={(e) => setSipForm({...sipForm, from: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                onClick={calculateSIP}
                disabled={sipLoading}
                style={{ marginBottom: '24px' }}
              >
                {sipLoading ? <CircularProgress size={24} /> : 'Calculate SIP Returns'}
              </Button>

              {sipResult && (
                <>
                  <Typography variant="h6" gutterBottom style={{ marginTop: '24px', marginBottom: '16px', color: '#1976d2' }}>
                    SIP Results
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={3} style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                        <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                          <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Total Invested</Typography>
                          <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{sipResult.totalInvested?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={3} style={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
                        <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                          <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Current Value</Typography>
                          <Typography variant="h5" style={{ fontWeight: 'bold' }}>₹{sipResult.currentValue?.toLocaleString()}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={3} style={{ background: sipResult.absoluteReturn >= 0 ? 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
                        <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                          <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Absolute Return</Typography>
                          <Typography variant="h5" style={{ fontWeight: 'bold' }}>{sipResult.absoluteReturn?.toFixed(2)}%</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card elevation={3} style={{ background: sipResult.annualizedReturn >= 0 ? 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
                        <CardContent style={{ textAlign: 'center', padding: '20px' }}>
                          <Typography variant="body2" style={{ opacity: 0.9, marginBottom: '8px' }}>Annualized Return</Typography>
                          <Typography variant="h5" style={{ fontWeight: 'bold' }}>{sipResult.annualizedReturn?.toFixed(2)}%</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}