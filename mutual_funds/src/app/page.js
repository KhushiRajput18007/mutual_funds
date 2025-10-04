'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Box, Grid, Card, CardContent, Container, Chip, Avatar, TextField, InputAdornment } from '@mui/material';
import { TrendingUp, Calculate, PieChart, Compare, Search, Star, Security, Speed } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

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

  const stats = [
    { label: 'Total Funds', value: '2,500+', icon: <TrendingUp /> },
    { label: 'Fund Houses', value: '45+', icon: <Security /> },
    { label: 'AUM Tracked', value: '₹50L Cr', icon: <PieChart /> }
  ];

  const features = [
    {
      title: 'Smart Fund Discovery',
      description: 'AI-powered recommendations based on your risk profile and goals',
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/funds'),
      buttonText: 'Explore Funds',
      variant: 'contained'
    },
    {
      title: 'Advanced Comparison',
      description: 'Compare funds with detailed analytics and performance metrics',
      icon: <Compare sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: () => router.push('/compare'),
      buttonText: 'Compare Now',
      variant: 'outlined'
    },
    {
      title: 'Portfolio Analytics',
      description: 'Track performance with real-time insights and rebalancing alerts',
      icon: <PieChart sx={{ fontSize: 40, color: 'success.main' }} />,
      action: () => router.push('/portfolio'),
      buttonText: 'Track Portfolio',
      variant: 'outlined'
    }
  ];

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 8, mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            mb: 3,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Smart Mutual Fund Investing
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.4 }}>
          Discover, analyze, and track mutual funds with AI-powered insights and real-time data
        </Typography>

        <Box sx={{ mb: 4 }}>
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
              width: { xs: '100%', sm: 450 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 1
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Button 
                    variant="contained"
                    size="small"
                    onClick={handleSearch}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Go
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/funds')}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 3,
              fontWeight: 600,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3
              }
            }}
          >
            Start Exploring
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => router.push('/compare')}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 3,
              fontWeight: 600,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2
              }
            }}
          >
            Compare Funds
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3, 
              borderRadius: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                {stat.icon}
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Feature Cards */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                p: 3, 
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {feature.icon}
              </Box>
              <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
                {feature.description}
              </Typography>
              <Button 
                variant={feature.variant}
                fullWidth
                onClick={feature.action}
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {feature.buttonText}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trust Indicators */}
      <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Trusted by investors across India
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Chip 
            icon={<Security />} 
            label="Bank-grade Security" 
            color="primary" 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Chip 
            icon={<Speed />} 
            label="Real-time Data" 
            color="secondary" 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          <Chip 
            icon={<Star />} 
            label="Expert Insights" 
            color="success" 
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Card>
    </Container>
  );
}