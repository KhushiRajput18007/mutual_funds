'use client';

import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, TextField, Button,
  Switch, FormControlLabel, Avatar, Alert, Chip, Select, MenuItem,
  FormControl, InputLabel, Paper
} from '@mui/material';
import { AccountCircle, Security, Notifications, Palette, Save } from '@mui/icons-material';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    riskProfile: 'moderate',
    investmentGoal: 'retirement',
    monthlyIncome: '50000-100000'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsAlerts: false,
    portfolioUpdates: true,
    marketNews: true,
    darkMode: false
  });

  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedPreferences = localStorage.getItem('userPreferences');
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your account preferences and investment profile
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Personal Information
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 3 }}>
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {profile.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {profile.email}
                  </Typography>
                  <Chip label="Verified" color="success" size="small" sx={{ mt: 1 }} />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Investment Profile
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Risk Profile</InputLabel>
                    <Select
                      value={profile.riskProfile}
                      label="Risk Profile"
                      onChange={(e) => handleProfileChange('riskProfile', e.target.value)}
                    >
                      <MenuItem value="conservative">Conservative</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="aggressive">Aggressive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Investment Goal</InputLabel>
                    <Select
                      value={profile.investmentGoal}
                      label="Investment Goal"
                      onChange={(e) => handleProfileChange('investmentGoal', e.target.value)}
                    >
                      <MenuItem value="retirement">Retirement</MenuItem>
                      <MenuItem value="wealth">Wealth Creation</MenuItem>
                      <MenuItem value="education">Child Education</MenuItem>
                      <MenuItem value="house">House Purchase</MenuItem>
                      <MenuItem value="emergency">Emergency Fund</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Monthly Income</InputLabel>
                    <Select
                      value={profile.monthlyIncome}
                      label="Monthly Income"
                      onChange={(e) => handleProfileChange('monthlyIncome', e.target.value)}
                    >
                      <MenuItem value="below-25000">Below ₹25,000</MenuItem>
                      <MenuItem value="25000-50000">₹25,000 - ₹50,000</MenuItem>
                      <MenuItem value="50000-100000">₹50,000 - ₹1,00,000</MenuItem>
                      <MenuItem value="100000-200000">₹1,00,000 - ₹2,00,000</MenuItem>
                      <MenuItem value="above-200000">Above ₹2,00,000</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Notifications sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Notification Preferences
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Communication
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.smsAlerts}
                          onChange={(e) => handlePreferenceChange('smsAlerts', e.target.checked)}
                        />
                      }
                      label="SMS Alerts"
                      sx={{ display: 'block' }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Content
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.portfolioUpdates}
                          onChange={(e) => handlePreferenceChange('portfolioUpdates', e.target.checked)}
                        />
                      }
                      label="Portfolio Updates"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.marketNews}
                          onChange={(e) => handlePreferenceChange('marketNews', e.target.checked)}
                        />
                      }
                      label="Market News"
                      sx={{ display: 'block' }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Palette sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  App Preferences
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.darkMode}
                    onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!hasChanges}
              sx={{ 
                px: 6, 
                py: 2, 
                borderRadius: 3,
                backgroundColor: hasChanges ? 'primary.main' : 'grey.400',
                '&:hover': {
                  backgroundColor: hasChanges ? 'primary.dark' : 'grey.400'
                }
              }}
            >
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Button>
            {hasChanges && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                You have unsaved changes
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}