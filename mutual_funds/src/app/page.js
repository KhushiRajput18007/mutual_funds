'use client';

import { Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Mutual Fund Explorer
      </Typography>
      
      <Typography variant="h6" component="p" gutterBottom align="center" color="text.secondary" style={{ marginBottom: '32px' }}>
        Discover, analyze, and calculate returns for mutual funds
      </Typography>

      <Grid container spacing={4} style={{ marginTop: '16px' }}>
        <Grid item xs={12} md={4}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Explore Funds
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                Browse mutual funds from various fund houses
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
              <Typography variant="h5" component="h2" gutterBottom>
                Compare Funds
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                Compare multiple funds side by side
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/compare')}
                fullWidth
              >
                Compare Funds
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent style={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Portfolio Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '16px' }}>
                Track your mutual fund investments
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => router.push('/portfolio')}
                fullWidth
              >
                View Portfolio
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}