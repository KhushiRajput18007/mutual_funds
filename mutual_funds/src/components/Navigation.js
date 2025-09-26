'use client';

import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Mutual Fund Explorer
          </Link>
        </Typography>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button color="inherit" component={Link} href="/funds">
            Browse Funds
          </Button>
          <Button color="inherit" component={Link} href="/compare">
            Compare
          </Button>
          <Button color="inherit" component={Link} href="/portfolio">
            Portfolio
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}