'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Box, Grid, Card, CardContent, Container, Chip, Avatar, TextField, InputAdornment } from '@mui/material';
import { TrendingUp, Calculate, PieChart, Compare, Search, Star, Security, Speed } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const stats = [
    { label: 'Total Funds', value: '2,500+', icon: <TrendingUp /> },
    { label: 'Fund Houses', value: '45+', icon: <Security /> },
    { label: 'AUM Tracked', value: '₹50L Cr', icon: <PieChart /> },
    { label: 'Active Users', value: '1M+', icon: <Star /> }
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
            fontWeight: 800, 
            mb: 3,
            background: 'linear-gradient(45deg, #00d4ff 30%, #ff6b35 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Smart Mutual Fund Investing
        </Typography>
        
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Discover, analyze, and track mutual funds with AI-powered insights and real-time data
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            placeholder="Search funds, AMCs, or categories..."
            variant="outlined"
            sx={{ 
              width: { xs: '100%', sm: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/funds')}
            sx={{ px: 4, py: 1.5, borderRadius: 3 }}
          >
            Start Exploring
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => router.push('/compare')}
            sx={{ px: 4, py: 1.5, borderRadius: 3 }}
          >
            Compare Funds
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ textAlign: 'center', p: 3, borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                {stat.icon}
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {feature.description}
              </Typography>
              <Button 
                variant={feature.variant}
                fullWidth
                onClick={feature.action}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {feature.buttonText}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trust Indicators */}
      <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Trusted by investors across India
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Chip icon={<Security />} label="Bank-grade Security" color="primary" variant="outlined" />
          <Chip icon={<Speed />} label="Real-time Data" color="secondary" variant="outlined" />
          <Chip icon={<Star />} label="Expert Insights" color="success" variant="outlined" />
        </Box>
      </Card>
    </Container>
  );
}