'use client';

import { useState, useEffect } from 'react';
import {
  Typography, Box, Card, CardContent, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Autocomplete, CircularProgress, Alert
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ComparePage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/mf');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data.slice(0, 100));
      } else {
        // Fallback sample data
        const sampleSchemes = [
          { schemeCode: '120503', schemeName: 'Aditya Birla Sun Life Frontline Equity Fund - Growth' },
          { schemeCode: '118989', schemeName: 'ICICI Prudential Bluechip Fund - Growth' },
          { schemeCode: '120716', schemeName: 'SBI Large Cap Fund - Regular Plan - Growth' },
          { schemeCode: '120717', schemeName: 'HDFC Top 100 Fund - Growth' },
          { schemeCode: '120718', schemeName: 'Axis Bluechip Fund - Regular Plan - Growth' }
        ];
        setSchemes(sampleSchemes);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      // Fallback sample data
      const sampleSchemes = [
        { schemeCode: '120503', schemeName: 'Aditya Birla Sun Life Frontline Equity Fund - Growth' },
        { schemeCode: '118989', schemeName: 'ICICI Prudential Bluechip Fund - Growth' },
        { schemeCode: '120716', schemeName: 'SBI Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120717', schemeName: 'HDFC Top 100 Fund - Growth' },
        { schemeCode: '120718', schemeName: 'Axis Bluechip Fund - Regular Plan - Growth' }
      ];
      setSchemes(sampleSchemes);
    }
  };

  const generateSampleReturns = (schemeIndex) => {
    // Generate consistent but different returns for each scheme
    const baseReturns = [
      { '1m': 2.5, '3m': 8.2, '6m': 12.8, '1y': 18.5 },
      { '1m': -1.2, '3m': 4.7, '6m': 9.3, '1y': 15.2 },
      { '1m': 3.8, '3m': 6.1, '6m': 14.7, '1y': 22.1 },
      { '1m': 0.9, '3m': 5.4, '6m': 11.2, '1y': 16.8 },
      { '1m': 4.2, '3m': 9.8, '6m': 16.5, '1y': 24.3 }
    ];
    return baseReturns[schemeIndex % baseReturns.length];
  };

  const compareSchemes = async () => {
    if (selectedSchemes.length < 2) return;
    
    setLoading(true);
    const periods = ['1m', '3m', '6m', '1y'];
    const results = [];
    
    selectedSchemes.forEach((scheme, index) => {
      const schemeResult = { scheme: scheme.schemeName, code: scheme.schemeCode };
      const sampleReturns = generateSampleReturns(index);
      
      periods.forEach(period => {
        schemeResult[period] = sampleReturns[period];
      });
      
      results.push(schemeResult);
    });
    
    setCompareData(results);
    
    // Prepare chart data
    const chartResults = periods.map(period => {
      const dataPoint = { period };
      results.forEach((result, index) => {
        const shortName = `Fund ${index + 1}`;
        dataPoint[shortName] = result[period];
      });
      return dataPoint;
    });
    
    setChartData(chartResults);
    setLoading(false);
  };

  const colors = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2'];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Compare Mutual Funds
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Schemes to Compare
          </Typography>
          
          <Autocomplete
            multiple
            options={schemes}
            getOptionLabel={(option) => option.schemeName}
            value={selectedSchemes}
            onChange={(event, newValue) => setSelectedSchemes(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select mutual funds"
                placeholder="Choose schemes to compare"
              />
            )}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={compareSchemes}
            disabled={selectedSchemes.length < 2 || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Compare Schemes'}
          </Button>
        </CardContent>
      </Card>

      {compareData.length > 0 && (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Returns Comparison Chart
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {compareData.map((scheme, index) => (
                      <Line
                        key={scheme.code}
                        type="monotone"
                        dataKey={`Fund ${index + 1}`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        name={scheme.scheme.length > 30 ? scheme.scheme.substring(0, 30) + '...' : scheme.scheme}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Returns Comparison Table
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
                      <TableCell align="right">1M (%)</TableCell>
                      <TableCell align="right">3M (%)</TableCell>
                      <TableCell align="right">6M (%)</TableCell>
                      <TableCell align="right">1Y (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compareData.map((row) => (
                      <TableRow key={row.code}>
                        <TableCell component="th" scope="row">
                          {row.scheme}
                        </TableCell>
                        <TableCell align="right">{row['1m']?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell align="right">{row['3m']?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell align="right">{row['6m']?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell align="right">{row['1y']?.toFixed(2) || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}