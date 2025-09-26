'use client';

import { useState, useEffect } from 'react';
import {
  Typography, Box, Card, CardContent, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Autocomplete, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Fab, Container, Stack, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PortfolioPage() {
  const [schemes, setSchemes] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [open, setOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    scheme: null,
    units: '',
    avgPrice: ''
  });

  useEffect(() => {
    fetchSchemes();
    loadPortfolio();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/mf');
      const data = await response.json();
      setSchemes(data.slice(0, 100));
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  const loadPortfolio = () => {
    const saved = localStorage.getItem('mf_portfolio');
    if (saved) {
      setPortfolio(JSON.parse(saved));
    }
  };

  const savePortfolio = (newPortfolio) => {
    localStorage.setItem('mf_portfolio', JSON.stringify(newPortfolio));
    setPortfolio(newPortfolio);
  };

  const addHolding = async () => {
    const units = parseFloat(newHolding.units);
    const avgPrice = parseFloat(newHolding.avgPrice);
    
    if (!newHolding.scheme || !units || units <= 0 || !avgPrice || avgPrice <= 0) return;

    try {
      // Get current NAV
      const response = await fetch(`/api/scheme/${newHolding.scheme.schemeCode}`);
      const data = await response.json();
      const currentNAV = parseFloat(data.data[0].nav);

      const holding = {
        id: Date.now(),
        scheme: newHolding.scheme,
        units: units,
        avgPrice: avgPrice,
        currentNAV: currentNAV,
        invested: units * avgPrice,
        currentValue: units * currentNAV
      };

      const newPortfolio = [...portfolio, holding];
      savePortfolio(newPortfolio);
      
      setOpen(false);
      setNewHolding({ scheme: null, units: '', avgPrice: '' });
    } catch (error) {
      console.error('Error adding holding:', error);
    }
  };

  const removeHolding = (id) => {
    const newPortfolio = portfolio.filter(h => h.id !== id);
    savePortfolio(newPortfolio);
  };

  const totalInvested = portfolio.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrentValue = portfolio.reduce((sum, h) => sum + h.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const pieData = portfolio.map((holding, index) => ({
    name: holding.scheme.schemeName.substring(0, 20),
    value: holding.currentValue,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }));

  const colors = pieData.map(item => item.color);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
            My Portfolio
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track your mutual fund investments and performance
          </Typography>
        </Box>

        {portfolio.length === 0 && (
          <Alert 
            severity="info" 
            action={
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                sx={{ ml: 2 }}
              >
                Add Your First Holding
              </Button>
            }
          >
            Start building your portfolio by adding your mutual fund holdings
          </Alert>
        )}

        <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Invested</Typography>
              <Typography variant="h5">₹{totalInvested.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Current Value</Typography>
              <Typography variant="h5">₹{totalCurrentValue.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Gain/Loss</Typography>
              <Typography variant="h5" color={totalGainLoss >= 0 ? 'success.main' : 'error.main'}>
                ₹{totalGainLoss.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Return %</Typography>
              <Typography variant="h5" color={totalGainLossPercent >= 0 ? 'success.main' : 'error.main'}>
                {totalGainLossPercent.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Portfolio Allocation Chart */}
        {portfolio.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Portfolio Allocation</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Holdings Table */}
        <Grid item xs={12} md={portfolio.length > 0 ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Holdings</Typography>
              {portfolio.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Scheme</TableCell>
                        <TableCell align="right">Units</TableCell>
                        <TableCell align="right">Avg Price</TableCell>
                        <TableCell align="right">Current NAV</TableCell>
                        <TableCell align="right">Invested</TableCell>
                        <TableCell align="right">Current Value</TableCell>
                        <TableCell align="right">Gain/Loss</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolio.map((holding) => {
                        const gainLoss = holding.currentValue - holding.invested;
                        const gainLossPercent = (gainLoss / holding.invested) * 100;
                        
                        return (
                          <TableRow key={holding.id}>
                            <TableCell>{holding.scheme.schemeName.substring(0, 30)}...</TableCell>
                            <TableCell align="right">{holding.units}</TableCell>
                            <TableCell align="right">₹{holding.avgPrice}</TableCell>
                            <TableCell align="right">₹{holding.currentNAV}</TableCell>
                            <TableCell align="right">₹{holding.invested.toLocaleString()}</TableCell>
                            <TableCell align="right">₹{holding.currentValue.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ color: gainLoss >= 0 ? 'success.main' : 'error.main' }}>
                              ₹{gainLoss.toLocaleString()} ({gainLossPercent.toFixed(2)}%)
                            </TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => removeHolding(holding.id)} size="small">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No holdings added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start tracking your mutual fund investments
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Your First Holding
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        {portfolio.length > 0 && (
          <Box textAlign="center">
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
              }}
            >
              Add New Holding
            </Button>
          </Box>
        )}

        <Fab
          color="primary"
          aria-label="add"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => setOpen(true)}
        >
          <AddIcon />
        </Fab>

      {/* Add Holding Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Holding</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={schemes}
                getOptionLabel={(option) => option.schemeName}
                value={newHolding.scheme}
                onChange={(event, newValue) => setNewHolding({...newHolding, scheme: newValue})}
                renderInput={(params) => (
                  <TextField {...params} label="Select Scheme" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Units"
                type="number"
                value={newHolding.units}
                onChange={(e) => setNewHolding({...newHolding, units: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Average Price (₹)"
                type="number"
                value={newHolding.avgPrice}
                onChange={(e) => setNewHolding({...newHolding, avgPrice: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={addHolding} variant="contained">Add Holding</Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </Container>
  );
}