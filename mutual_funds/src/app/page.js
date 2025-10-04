'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Box, Grid, Card, CardContent, Container, TextField, InputAdornment, Avatar, Chip } from '@mui/material';
import { Search, TrendingUp, AccountBalance, Assessment, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/funds?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/funds');
    }
  };

  if (!mounted) {
    return null;
  }

  const portfolioData = [
    { name: 'Nov 1', value: 65000 },
    { name: 'Nov 2', value: 67000 },
    { name: 'Nov 3', value: 66500 },
    { name: 'Nov 4', value: 68000 },
    { name: 'Nov 5', value: 70000 },
    { name: 'Nov 6', value: 69500 },
    { name: 'Nov 7', value: 70000 }
  ];

  const topFunds = [
    { name: 'Aditya Birla Sun Life Resurgent India Fund', invested: '₹6,000', current: '₹6,348', return: '+5.8%', positive: true },
    { name: 'Aditya Birla Sun Life MNC Fund', invested: '₹3,999', current: '₹4,068', return: '+1.72%', positive: true },
    { name: 'Aditya Birla Sun Life India GenNext Fund', invested: '₹12,000', current: '₹11,600', return: '-3.33%', positive: false }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Illustrations */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                color: 'white',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Mutual Fund App
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 6,
                fontWeight: 400
              }}
            >
              Let save mutual funds
            </Typography>

            {/* Search Bar */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <TextField
                placeholder="Search funds, AMCs, or categories..."
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{ 
                  width: { xs: '100%', sm: 500 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 3,
                    '& fieldset': {
                      border: 'none'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/funds')}
              sx={{ 
                px: 6, 
                py: 2, 
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }
              }}
            >
              Start Exploring
            </Button>
          </motion.div>
        </Box>

        {/* Portfolio Dashboard */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* Portfolio Value Card */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card sx={{ 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                p: 3,
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Folio No. 1010002144
                  </Typography>
                  <Chip 
                    label="0.9%" 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#5c6bc0', mb: 1 }}>
                  ₹70,000
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  CURRENT MARKET VALUE
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">TOTAL INVESTED</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>₹65,000</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">APPRECIATION / LOSS</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>+₹5,000</Typography>
                  </Box>
                </Box>

                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5c6bc0" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#5c6bc0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#5c6bc0" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card sx={{ 
                borderRadius: 4,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                p: 3,
                height: '100%'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push('/funds')}
                      sx={{
                        py: 3,
                        borderRadius: 3,
                        backgroundColor: '#ffd54f',
                        color: '#333',
                        flexDirection: 'column',
                        '&:hover': {
                          backgroundColor: '#ffcc02'
                        }
                      }}
                    >
                      <Avatar sx={{ backgroundColor: '#ff9800', mb: 1 }}>
                        <TrendingUp />
                      </Avatar>
                      Purchase
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push('/portfolio')}
                      sx={{
                        py: 3,
                        borderRadius: 3,
                        backgroundColor: '#81c784',
                        color: 'white',
                        flexDirection: 'column',
                        '&:hover': {
                          backgroundColor: '#66bb6a'
                        }
                      }}
                    >
                      <Avatar sx={{ backgroundColor: '#4caf50', mb: 1 }}>
                        <Assessment />
                      </Avatar>
                      Switch
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push('/compare')}
                      sx={{
                        py: 3,
                        borderRadius: 3,
                        backgroundColor: '#9575cd',
                        color: 'white',
                        flexDirection: 'column',
                        '&:hover': {
                          backgroundColor: '#7e57c2'
                        }
                      }}
                    >
                      <Avatar sx={{ backgroundColor: '#673ab7', mb: 1 }}>
                        <AccountBalance />
                      </Avatar>
                      Redeem
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        py: 3,
                        borderRadius: 3,
                        backgroundColor: '#4fc3f7',
                        color: 'white',
                        flexDirection: 'column',
                        '&:hover': {
                          backgroundColor: '#29b6f6'
                        }
                      }}
                    >
                      <Avatar sx={{ backgroundColor: '#03a9f4', mb: 1 }}>
                        <TrendingUp />
                      </Avatar>
                      SIP
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Top Performing Funds */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card sx={{ 
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            p: 3,
            mb: 4
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Your Investments
            </Typography>
            
            {topFunds.map((fund, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 2,
                borderBottom: index < topFunds.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {fund.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Invested: {fund.invested}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current: {fund.current}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {fund.positive ? (
                    <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
                  ) : (
                    <ArrowDownward sx={{ color: '#f44336', fontSize: 16 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: fund.positive ? '#4caf50' : '#f44336'
                    }}
                  >
                    {fund.return}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}