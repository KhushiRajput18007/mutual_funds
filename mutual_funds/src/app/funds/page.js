'use client';

import { useState, useEffect } from 'react';
import {
  Typography, TextField, Grid, Card, CardContent, CardActionArea,
  Box, Chip, CircularProgress, InputAdornment, Container, Paper,
  Skeleton, Stack, Fade, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FundsPage() {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [displayedSchemes, setDisplayedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(6);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchSchemes();
    // Get search query from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

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