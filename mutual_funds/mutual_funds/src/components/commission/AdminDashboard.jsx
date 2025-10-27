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
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  People,
  Download,
  MonetizationOn,
  Person,
  Business
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard = ({ adminId, adminName = "Admin" }) => {
  const [commissionData, setCommissionData] = useState(null);
  const [availableData, setAvailableData] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch admin commission data
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/commissions/monthly?role=admin&userId=${adminId}&limit=12`);
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

  // Fetch available withdrawals for admin
  const fetchAvailableData = async () => {
    try {
      const response = await fetch(`/api/commissions/available?role=admin&userId=${adminId}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableData(data.data);
      }
    } catch (err) {
      console.error('Error fetching available data:', err);
    }
  };

  // Fetch system-wide commission statistics
  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/cron/commissions');
      const data = await response.json();
      
      if (data.success) {
        setSystemStats(data.statistics);
      }
    } catch (err) {
      console.error('Error fetching system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle admin withdrawal
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
          role: 'admin',
          userId: adminId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await Promise.all([fetchCommissionData(), fetchAvailableData(), fetchSystemStats()]);
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
    if (adminId) {
      Promise.all([fetchCommissionData(), fetchAvailableData(), fetchSystemStats()]);
    }
  }, [adminId]);

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
  
  // System-wide data for charts
  const pieData = systemStats?.availableForWithdrawal ? [
    { name: 'Available', value: systemStats.availableForWithdrawal.amount, color: '#4facfe' },
    { name: 'Current Month', value: systemStats.currentMonth?.accrued?.amount || 0, color: '#667eea' },
    { name: 'Withdrawn', value: (systemStats.overall?.totalCommissions || 0) - (systemStats.availableForWithdrawal.amount || 0), color: '#f093fb' }
  ] : [];

  const chartData = trends.slice(0, 6).reverse().map(trend => ({
    period: `${trend.period.month}/${trend.period.year}`,
    adminShare: trend.userShare,
    totalCommission: trend.totalCommission,
    customerCount: trend.customerCount
  }));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        🛠️ {adminName} Admin Dashboard
      </Typography>

      {/* Admin Earnings Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Your Monthly Earnings
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{currentMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Admin Commission
                  </Typography>
                </div>
                <MonetizationOn sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    System Total AUM
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{((systemStats?.overall?.totalPortfolioValue || 0) / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    All Portfolios
                  </Typography>
                </div>
                <TrendingUp sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Your Available
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    ₹{(availableData?.totalAvailable || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    For Withdrawal
                  </Typography>
                </div>
                <AccountBalanceWallet sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography variant="h6" gutterBottom>
                    Total Records
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {systemStats?.overall?.totalRecords || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Commission Records
                  </Typography>
                </div>
                <Business sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Withdrawal Section */}
      {availableData?.available && availableData.totalAvailable > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <div>
                <Typography variant="h6" gutterBottom>
                  💰 Admin Withdrawal Available
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

      {/* Tabs for different views */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="📊 System Overview" />
          <Tab label="📈 Performance Charts" />
          <Tab label="📋 Commission Records" />
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* System Commission Distribution Pie Chart */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  💼 System Commission Distribution
                </Typography>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ₹${value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                    <Typography variant="body1" color="text.secondary">
                      No commission data available for charts
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* System Statistics */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  📊 System Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <MonetizationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Total System Commissions"
                      secondary={`₹${(systemStats?.overall?.totalCommissions || 0).toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <AccountBalanceWallet />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Available for Withdrawal (All Users)"
                      secondary={`₹${(systemStats?.availableForWithdrawal?.amount || 0).toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Business />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Total Portfolio Value"
                      secondary={`₹${(systemStats?.overall?.totalPortfolioValue || 0).toLocaleString()}`}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📈 Admin Commission Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`,
                      name === 'adminShare' ? 'Admin Share' : 
                      name === 'totalCommission' ? 'Total Commission' : 'Customers'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="adminShare" fill="#667eea" name="Admin Share" />
                  <Bar dataKey="totalCommission" fill="#f093fb" name="Total Commission" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📋 Recent Commission Records
              </Typography>
              {commissionData?.commissions && commissionData.commissions.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Period</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Portfolio Value</TableCell>
                        <TableCell>Total Commission</TableCell>
                        <TableCell>Admin Share</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionData.commissions.slice(0, 10).map((commission) => (
                        <TableRow key={commission._id}>
                          <TableCell>
                            {commission.period.month}/{commission.period.year}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                <Person sx={{ fontSize: 16 }} />
                              </Avatar>
                              {commission.customerId.slice(-6)}
                            </Box>
                          </TableCell>
                          <TableCell>₹{commission.portfolioValue.toLocaleString()}</TableCell>
                          <TableCell>₹{commission.totalCommission.toLocaleString()}</TableCell>
                          <TableCell>₹{commission.breakdown.admin.toLocaleString()}</TableCell>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                  <Typography variant="body1" color="text.secondary">
                    No commission records found
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      {systemStats?.recentActivity && systemStats.recentActivity.length > 0 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🕒 Recent System Activity
            </Typography>
            <Grid container spacing={2}>
              {systemStats.recentActivity.map((activity, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" color="primary">
                      {activity.period}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{activity.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.count} records
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminDashboard;