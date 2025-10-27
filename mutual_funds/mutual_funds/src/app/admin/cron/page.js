"use client";
import React, { useState } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, Grid, Alert, Snackbar } from '@mui/material';

export default function AdminCronControlPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const trigger = async (action) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setToast({ open: true, message: `Triggered: ${action}`, severity: 'success' });
      } else {
        setToast({ open: true, message: json?.error || 'Failed to trigger', severity: 'error' });
      }
    } catch (e) {
      setToast({ open: true, message: 'Failed to trigger', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Commission Cron Controls</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" disabled={loading} onClick={() => trigger('generate')}>Generate (1st)</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" color="secondary" disabled={loading} onClick={() => trigger('mark_available')}>Mark Available (5th)</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" disabled={loading} onClick={() => trigger('both')}>Both</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
