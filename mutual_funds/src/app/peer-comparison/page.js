'use client';

import { useState, useEffect } from 'react';
import {
  Typography, Box, Card, CardContent, Grid, Button, Container,
  Chip, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { TrendingUp, TrendingDown, FilterList } from '@mui/icons-material';

export default function PeerComparisonPage() {
  const [filter, setFilter] = useState('high-returns');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPeerComparison();
  }, [filter]);

  const fetchPeerComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/peer-comparison?filter=${filter}`);
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (error) {
      setError('Failed to fetch peer comparison data');
    } finally {
      setLoading(false);
    }
  };

  const getFilterDescription = () => {
    switch (filter) {
      case 'high-returns':
        return 'Funds with 1-year returns above 8%';
      case '3-years':
        return 'Funds aged between 3-5 years';
      case '10-years':
        return 'Established funds with 10+ years track record';
      case 'top-performers':
        return 'Top performing funds with returns above 15%';
      case 'all':
        return 'All available funds in the comparison';
      default:
        return '';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Peer Comparison
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Compare mutual funds based on performance and characteristics
        </Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FilterList color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Filter Options
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={filter}
                  label="Filter Type"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="high-returns">High Returns (&gt;8%)</MenuItem>
                  <MenuItem value="3-years">3-5 Year Funds</MenuItem>
                  <MenuItem value="10-years">10+ Year Funds</MenuItem>
                  <MenuItem value="top-performers">Top Performers (&gt;15%)</MenuItem>
                  <MenuItem value="all">All Funds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" color="text.secondary">
                {getFilterDescription()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : data ? (
        <>
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Results ({data.count} funds found)
                </Typography>
                <Chip 
                  label={filter.replace('-', ' ').toUpperCase()} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fund Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fund House</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">1Y Returns</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Age (Years)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Latest NAV</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.schemes.map((scheme, index) => (
                      <TableRow 
                        key={scheme.schemeCode}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                          '&:hover': { backgroundColor: 'action.selected' }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {scheme.schemeName.length > 50 
                              ? scheme.schemeName.substring(0, 50) + '...' 
                              : scheme.schemeName}
                          </Typography>
                        </TableCell>
                        <TableCell>{scheme.fundHouse}</TableCell>
                        <TableCell>
                          <Chip 
                            label={scheme.category} 
                            size="small" 
                            variant="outlined"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {scheme.returns1Y >= 0 ? (
                              <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
                            ) : (
                              <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={scheme.returns1Y >= 0 ? 'success.main' : 'error.main'}
                            >
                              {scheme.returns1Y.toFixed(2)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{scheme.age}</TableCell>
                        <TableCell align="right">₹{scheme.latestNAV.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </Container>
  );
}