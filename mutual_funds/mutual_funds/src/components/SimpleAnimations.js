'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const SimpleAnimatedCard = ({ 
  title, 
  value, 
  subtitle, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  delay = 0 
}) => {
  return (
    <Card 
      sx={{ 
        background: gradient,
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 180,
        animation: `${fadeInUp} 0.6s ease ${delay}s both`,
        '&:hover': {
          animation: `${pulse} 0.3s ease`,
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {subtitle}
        </Typography>
      </CardContent>
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 1
        }}
      />
    </Card>
  );
};

const SimpleChart = ({ data, title, height = 300 }) => {
  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: 2
        }}>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea"/>
                <stop offset="100%" stopColor="#764ba2"/>
              </linearGradient>
            </defs>
            <path 
              d="M50 150 Q100 100 150 120 T250 80 T350 60" 
              stroke="url(#chartGradient)" 
              strokeWidth="3" 
              fill="none"
            />
            <circle cx="50" cy="150" r="4" fill="#667eea"/>
            <circle cx="150" cy="120" r="4" fill="#667eea"/>
            <circle cx="250" cy="80" r="4" fill="#667eea"/>
            <circle cx="350" cy="60" r="4" fill="#667eea"/>
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
};

export { SimpleAnimatedCard, SimpleChart };