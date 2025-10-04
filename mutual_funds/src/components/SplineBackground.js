'use client';

import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      minHeight: 400 
    }}>
      <CircularProgress />
    </Box>
  )
});

const SplineBackground = ({ scene, style = {} }) => {
  const defaultStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
    overflow: 'hidden',
    ...style
  };

  return (
    <Box sx={defaultStyle}>
      <Suspense fallback={
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderRadius: 2
        }}>
          <CircularProgress />
        </Box>
      }>
        <Spline 
          scene={scene || "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </Box>
  );
};

export default SplineBackground;