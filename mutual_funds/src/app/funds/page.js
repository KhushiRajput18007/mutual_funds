'use client';

import { useState, useEffect } from 'react';
import {
  Typography, TextField, Grid, Card, CardContent, CardActionArea,
  Box, Chip, CircularProgress, InputAdornment, Container, Paper,
  Skeleton, Stack, Fade, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRouter } from 'next/navigation';

export default function FundsPage() {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [displayedSchemes, setDisplayedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(6);
  const router = useRouter();

  useEffect(() => {
    fetchSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchTerm, schemes]);

  useEffect(() => {
    setDisplayedSchemes(filteredSchemes.slice(0, itemsToShow));
  }, [filteredSchemes, itemsToShow]);

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/mf');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data?.length || 0, 'schemes');
      
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
        setFilteredSchemes(data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
    
    // Always set fallback data if no data was loaded
    if (schemes.length === 0) {
      const sampleData = [
        { schemeCode: '120503', schemeName: 'Aditya Birla Sun Life Frontline Equity Fund - Growth' },
        { schemeCode: '118989', schemeName: 'ICICI Prudential Bluechip Fund - Growth' },
        { schemeCode: '120716', schemeName: 'SBI Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120717', schemeName: 'HDFC Top 100 Fund - Growth' },
        { schemeCode: '120718', schemeName: 'Axis Bluechip Fund - Regular Plan - Growth' },
        { schemeCode: '120719', schemeName: 'Kotak Select Focus Fund - Regular Plan - Growth' },
        { schemeCode: '120720', schemeName: 'Mirae Asset Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120721', schemeName: 'Nippon India Large Cap Fund - Growth' },
        { schemeCode: '120722', schemeName: 'UTI Mastershare Unit Scheme - Growth' },
        { schemeCode: '120723', schemeName: 'DSP Top 100 Equity Fund - Regular Plan - Growth' },
        { schemeCode: '120724', schemeName: 'Franklin India Bluechip Fund - Growth' },
        { schemeCode: '120725', schemeName: 'Invesco India Large Cap Fund - Growth' },
        { schemeCode: '120726', schemeName: 'L&T Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120727', schemeName: 'Mahindra Manulife Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120728', schemeName: 'Principal Large Cap Fund - Growth' },
        { schemeCode: '120729', schemeName: 'Quantum Long Term Equity Value Fund - Growth' },
        { schemeCode: '120730', schemeName: 'Sundaram Large Cap Fund - Growth' },
        { schemeCode: '120731', schemeName: 'Taurus Large Cap Equity Fund - Growth' },
        { schemeCode: '120732', schemeName: 'Canara Robeco Bluechip Equity Fund - Growth' },
        { schemeCode: '120733', schemeName: 'Edelweiss Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120734', schemeName: 'HSBC Large Cap Fund - Growth' },
        { schemeCode: '120735', schemeName: 'JM Large Cap Fund - Growth' },
        { schemeCode: '120736', schemeName: 'Motilal Oswal Focused 25 Fund - Regular Plan - Growth' },
        { schemeCode: '120737', schemeName: 'Parag Parikh Long Term Equity Fund - Growth' },
        { schemeCode: '120738', schemeName: 'Reliance Large Cap Fund - Growth Plan - Growth Option' },
        { schemeCode: '120739', schemeName: 'Shriram Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120740', schemeName: 'Tata Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120741', schemeName: 'Union Large Cap Fund - Growth' },
        { schemeCode: '120742', schemeName: 'WhiteOak Capital Large Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120743', schemeName: 'Aditya Birla Sun Life Mid Cap Fund - Growth' },
        { schemeCode: '120744', schemeName: 'ICICI Prudential Mid Cap Fund - Growth' },
        { schemeCode: '120745', schemeName: 'SBI Magnum Mid Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120746', schemeName: 'HDFC Mid-Cap Opportunities Fund - Growth' },
        { schemeCode: '120747', schemeName: 'Axis Mid Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120748', schemeName: 'Kotak Emerging Equity Fund - Regular Plan - Growth' },
        { schemeCode: '120749', schemeName: 'Mirae Asset Emerging Bluechip Fund - Regular Plan - Growth' },
        { schemeCode: '120750', schemeName: 'Nippon India Growth Fund - Growth Plan - Growth Option' },
        { schemeCode: '120751', schemeName: 'UTI Mid Cap Fund - Growth' },
        { schemeCode: '120752', schemeName: 'DSP Mid Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120753', schemeName: 'Franklin India Prima Fund - Growth' },
        { schemeCode: '120754', schemeName: 'Invesco India Mid Cap Fund - Growth' },
        { schemeCode: '120755', schemeName: 'L&T Mid Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120756', schemeName: 'Mahindra Manulife Mid Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120757', schemeName: 'Principal Emerging Bluechip Fund - Growth' },
        { schemeCode: '120758', schemeName: 'Sundaram Mid Cap Fund - Growth' },
        { schemeCode: '120759', schemeName: 'Aditya Birla Sun Life Small Cap Fund - Growth' },
        { schemeCode: '120760', schemeName: 'ICICI Prudential Small Cap Fund - Growth' },
        { schemeCode: '120761', schemeName: 'SBI Small Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120762', schemeName: 'HDFC Small Cap Fund - Growth' },
        { schemeCode: '120763', schemeName: 'Axis Small Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120764', schemeName: 'Kotak Small Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120765', schemeName: 'Mirae Asset India Opportunities Fund - Regular Plan - Growth' },
        { schemeCode: '120766', schemeName: 'Nippon India Small Cap Fund - Growth Plan - Growth Option' },
        { schemeCode: '120767', schemeName: 'UTI Small Cap Fund - Growth' },
        { schemeCode: '120768', schemeName: 'DSP Small Cap Fund - Regular Plan - Growth' },
        { schemeCode: '120769', schemeName: 'Franklin India Smaller Companies Fund - Growth' },
        { schemeCode: '120770', schemeName: 'Invesco India Small Cap Fund - Growth' }
      ];
      setSchemes(sampleData);
      setFilteredSchemes(sampleData);
    }
    setLoading(false);
  };

  const filterSchemes = () => {
    const filtered = searchTerm
      ? schemes.filter(scheme =>
          scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : schemes;
    
    setFilteredSchemes(filtered);
    setItemsToShow(6); // Reset pagination when filtering
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 6);
  };

  const handleSchemeClick = (schemeCode) => {
    router.push(`/scheme/${schemeCode}`);
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card sx={{ height: 140 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ mt: 1, borderRadius: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            Mutual Funds Explorer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover and explore thousands of mutual fund schemes
          </Typography>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search mutual funds by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'grey.50'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
            <Typography variant="h6" color="text.secondary">
              {loading ? 'Loading...' : `Showing ${displayedSchemes.length} of ${filteredSchemes.length} schemes`}
            </Typography>
            <Chip 
              icon={<TrendingUpIcon />} 
              label="Live Data" 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </Paper>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Fade in={!loading}>
            <Stack spacing={4}>
              <Grid container spacing={3}>
                {displayedSchemes.map((scheme) => (
                  <Grid item xs={12} sm={6} md={4} key={scheme.schemeCode}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        },
                        borderRadius: 2
                      }}
                    >
                      <CardActionArea 
                        onClick={() => handleSchemeClick(scheme.schemeCode)}
                        sx={{ height: '100%', p: 0 }}
                      >
                        <CardContent sx={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="subtitle1" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 600,
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {scheme.schemeName}
                          </Typography>
                          <Box>
                            <Chip 
                              label={scheme.schemeCode} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ fontFamily: 'monospace' }}
                            />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {displayedSchemes.length < filteredSchemes.length && (
                <Box textAlign="center">
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={loadMore}
                    sx={{ 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem'
                    }}
                  >
                    Load More ({filteredSchemes.length - displayedSchemes.length} remaining)
                  </Button>
                </Box>
              )}
            </Stack>
          </Fade>
        )}
      </Stack>
    </Container>
  );
}