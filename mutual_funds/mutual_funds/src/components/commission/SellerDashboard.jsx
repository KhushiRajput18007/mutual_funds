import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  Schedule,
  Download,
  MonetizationOn
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SellerDashboard = ({ sellerId, sellerName = "Seller" }) => {
  const [commissionData, setCommissionData] = useState(null);
  const [availableData, setAvailableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch commission data
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/commissions/monthly?role=seller&userId=${sellerId}&limit=12`);
      const data = await response.json();
      
      if (data.success) {
        setCommissionData(data.data);
      } else {
        setError(data.error || 'Failed to fetch commission data');
      }
    } catch (err) {
      setError('Network error while fetching commission data');
    }
  };

  // Fetch available withdrawals
  const fetchAvailableData = async () => {
    try {
      const response = await fetch(`/api/commissions/available?role=seller&userId=${sellerId}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableData(data.data);
      }
    } catch (err) {
      console.error('Error fetching available data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!availableData?.available || availableData.totalAvailable <= 0) return;

    try {
      setWithdrawing(true);
      const response = await fetch('/api/commissions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'seller',
          userId: sellerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data after successful withdrawal
        await Promise.all([fetchCommissionData(), fetchAvailableData()]);
        alert(`Successfully withdrew ₹${data.data.withdrawnAmount}`);
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      alert('Network error during withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      Promise.all([fetchCommissionData(), fetchAvailableData()]);
    }
  }, [sellerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ margin: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentMonth = commissionData?.summary?.currentMonth || 0;
  const annualProjection = currentMonth * 12;
  const trends = commissionData?.trends || [];
  const chartData = trends.slice(0, 6).reverse().map(trend => ({
    period: `${trend.period.month}/${trend.period.year}`,
    amount: trend.userShare,
    aum: trend.portfolioValue / 100000 // Convert to lakhs
  }));

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        📊 {sellerName} Commission Dashboard
      </Typography>

      {/* Current Month Earnings Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Current Month Earnings
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{currentMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {commissionData?.currentPeriod?.month}/{commissionData?.currentPeriod?.year}
                  </Typography>
                </div>
                <MonetizationOn sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Annual Projection
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{annualProjection.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Based on current AUM
                  </Typography>
                </div>
                <TrendingUp sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Available for Withdrawal
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{(availableData?.totalAvailable || 0).toLocaleString()}
                  </Typography>
                  <Chip
                    label={availableData?.available ? "Available" : "Not Available"}
                    color={availableData?.available ? "success" : "default"}
                    size="small"
                    sx={{ mt: 1, color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                </div>
                <AccountBalanceWallet sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Withdrawal Section */}
      {availableData?.available && availableData.totalAvailable > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography variant="h6" gutterBottom>
                  💰 Withdrawal Available
                </Typography>
                <Typography variant="body1">
                  You have ₹{availableData.totalAvailable.toLocaleString()} available for withdrawal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From {availableData.recordCount} commission record(s)
                </Typography>
              </div>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleWithdraw}
                disabled={withdrawing}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                }}
              >
                {withdrawing ? <CircularProgress size={20} color="inherit" /> : 'Withdraw Now'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Not Available Message */}
      {availableData && !availableData.available && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center">
            <Schedule sx={{ mr: 1 }} />
            Withdrawals are available from the 5th of each month. 
            Next available: {new Date(availableData.nextAvailableDate).toLocaleDateString()}
          </Box>
        </Alert>
      )}

      {/* Earnings Trend Chart */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Monthly Earnings Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'amount' ? `₹${value.toLocaleString()}` : `₹${value.toFixed(2)}L`,
                  name === 'amount' ? 'Commission' : 'AUM'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="aum" 
                stroke="#f093fb" 
                strokeWidth={2}
                dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Commission Records */}
      {commissionData?.commissions && commissionData.commissions.length > 0 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Recent Commission Records
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Portfolio Value</TableCell>
                    <TableCell>Your Share</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Withdrawal Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissionData.commissions.slice(0, 10).map((commission) => (
                    <TableRow key={commission._id}>
                      <TableCell>
                        {commission.period.month}/{commission.period.year}
                      </TableCell>
                      <TableCell>₹{commission.portfolioValue.toLocaleString()}</TableCell>
                      <TableCell>₹{commission.breakdown.seller.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={commission.status}
                          color={
                            commission.status === 'withdrawn' ? 'success' :
                            commission.status === 'available' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {commission.withdrawalDate 
                          ? new Date(commission.withdrawalDate).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SellerDashboard;