'use client';

import { Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalculateIcon from '@mui/icons-material/Calculate';
import SearchIcon from '@mui/icons-material/Search';

export default function Home() {
  const router = useRouter();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Mutual Fund Explorer
      </Typography>
      
      <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary" style={{ marginBottom: '32px' }}>
        Discover, analyze, and calculate returns for mutual funds with our comprehensive SIP calculator
      </Typography>

      <Grid container spacing={4} style={{ marginTop: '16px' }}>
        <Grid item xs={12} md={4}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1, textAlign: 'center' }}>
              <SearchIcon style={{ fontSize: 60, color: '#1976d2', marginBottom: '16px' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Explore Funds
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                Browse through thousands of mutual funds from various fund houses and categories
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => router.push('/funds')}
                fullWidth
              >
                Browse Funds
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1, textAlign: 'center' }}>
              <TrendingUpIcon style={{ fontSize: 60, color: '#1976d2', marginBottom: '16px' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Analyze Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                View detailed NAV charts and historical performance data
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/funds')}
                fullWidth
              >
                View Analysis
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1, textAlign: 'center' }}>
              <CalculateIcon style={{ fontSize: 60, color: '#1976d2', marginBottom: '16px' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                SIP Calculator
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                Calculate returns for systematic investment plans with historical data
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/funds')}
                fullWidth
              >
                Calculate SIP
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}