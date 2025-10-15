'use client';

import { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Box, Chip, 
  CircularProgress, Button, Alert, Divider, Stack, Paper,
  Accordion, AccordionSummary, AccordionDetails, Tooltip,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ActiveFundsDemoPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      setRefreshing(forceRefresh);
      setError(null);
      
      const url = `/api/funds/active-funds-info?sample=50${forceRefresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 50%, #02b8a2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Active Funds Filtering Demo
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Live demonstration of how we identify active mutual funds using isinGrowth field
          </Typography>
          
          <Alert severity="info" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            <Typography variant="body2">
              <strong>How it works:</strong> We filter mutual funds from the MFAPI by checking the 'isinGrowth' field. 
              Funds with non-null isinGrowth values are considered active, while those with null values are inactive.
            </Typography>
          </Alert>
        </Box>
      </motion.div>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading active funds data...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fetching and analyzing mutual fund schemes
          </Typography>
        </Box>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6">Error Loading Data</Typography>
            <Typography>{error}</Typography>
            <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
              Try Again
            </Button>
          </Alert>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Stack spacing={4}>
            {/* Statistics Overview */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                  Filtering Statistics
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', border: 'none' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Schemes
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {data?.stats?.totalSchemes?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        From MFAPI.in
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', border: 'none' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Processed
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {data?.stats?.processedSchemes || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sample analyzed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', border: 'none' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Funds
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {data?.stats?.activeFunds || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Has isinGrowth data
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', border: 'none' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Inactive Funds
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {data?.stats?.inactiveFunds || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Missing isinGrowth
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {data?.stats && (
                <Box mt={3}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Active Fund Success Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(data.stats.activeFunds / data.stats.processedSchemes) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {((data.stats.activeFunds / data.stats.processedSchemes) * 100).toFixed(1)}% of processed funds are active
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Active Funds Display */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h4" fontWeight="bold" mb={3}>
                Active Mutual Funds
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label={`${data?.data?.length || 0} funds`} 
                  color="success" 
                  sx={{ ml: 2 }}
                />
              </Typography>

              <Typography variant="body1" color="text.secondary" mb={4}>
                These funds have been identified as active because they contain valid ISIN Growth codes.
              </Typography>

              <Grid container spacing={3}>
                {data?.data?.map((fund, index) => (
                  <Grid item xs={12} md={6} lg={4} key={fund.schemeCode}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'success.light',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[8],
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, pr: 1 }}>
                              {fund.schemeName}
                            </Typography>
                            <Tooltip title="Active Fund">
                              <CheckCircleIcon color="success" />
                            </Tooltip>
                          </Stack>

                          <Chip 
                            label={fund.category} 
                            size="small" 
                            sx={{ mb: 2 }}
                            color="primary"
                            variant="outlined"
                          />

                          <Divider sx={{ my: 2 }} />

                          <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                Scheme Code:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {fund.schemeCode}
                              </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2" color="text.secondary">
                                ISIN Growth:
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="bold" 
                                color="success.main"
                                sx={{ fontFamily: 'monospace' }}
                              >
                                {fund.isinGrowth}
                              </Typography>
                            </Box>

                            {fund.nav && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Latest NAV:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  ₹{fund.nav.toFixed(2)}
                                </Typography>
                              </Box>
                            )}

                            {fund.fundHouse && fund.fundHouse !== 'Unknown' && (
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Fund House:
                                </Typography>
                                <Typography variant="body2">
                                  {fund.fundHouse}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {(!data?.data || data.data.length === 0) && (
                <Box textAlign="center" py={8}>
                  <Typography variant="h6" color="text.secondary">
                    No active funds found in the current sample
                  </Typography>
                  <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
                    Try Refreshing
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Technical Details */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Technical Implementation Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body1">
                    <strong>Filtering Logic:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The active funds identification process works as follows:
                  </Typography>
                  <Box component="ol" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body2">
                        Fetch all mutual fund schemes from https://api.mfapi.in/mf
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        For each scheme, get detailed information from https://api.mfapi.in/mf/{'{schemeCode}'}
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Extract the <code>isinGrowth</code> field from the <code>meta</code> object
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        If <code>isinGrowth</code> is not null and not empty, the fund is considered active
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Active funds are collected with additional metadata like NAV, category, etc.
                      </Typography>
                    </li>
                  </Box>

                  <Typography variant="body1" sx={{ mt: 3 }}>
                    <strong>Code Example:</strong>
                  </Typography>
                  <Box 
                    component="pre" 
                    sx={{ 
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem'
                    }}
                  >
{`const meta = detailData?.meta || {};
const isinGrowth = meta.isin_growth || meta.isinGrowth || null;

if (isinGrowth && isinGrowth.trim() !== '') {
  // This fund is ACTIVE
  activeFunds.push({
    schemeCode: scheme.schemeCode,
    schemeName: scheme.schemeName,
    isinGrowth: isinGrowth,
    // ... other details
  });
} else {
  // This fund is INACTIVE
  inactiveFunds++;
}`}
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Cache Info */}
            {data && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Cache Info:</strong> This data is cached for 5 minutes. 
                  Data source: {data.fromCache ? 'Cache' : 'Live API'}
                  {data.lastUpdated && (
                    <> • Last updated: {new Date(data.lastUpdated).toLocaleString()}</>
                  )}
                </Typography>
              </Alert>
            )}
          </Stack>
        </motion.div>
      )}
    </Container>
  );
}