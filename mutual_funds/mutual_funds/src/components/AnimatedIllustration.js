'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { growthAnimation, investmentAnimation } from '@/data/lottieAnimations';

// Default animations mapping
const defaultAnimations = {
  growth: growthAnimation,
  investment: investmentAnimation
};

const AnimatedIllustration = ({ 
  type = 'growth', 
  title, 
  description, 
  animationData,
  size = 300,
  autoplay = true 
}) => {
  const animation = animationData || defaultAnimations[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Box sx={{ 
        textAlign: 'center', 
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
      }}>
        <Box sx={{ 
          width: size, 
          height: size, 
          mx: 'auto', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {animation ? (
            <Lottie 
              animationData={animation}
              loop={true}
              autoplay={autoplay}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            // Fallback SVG illustration
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="150" fill="url(#gradient)" opacity="0.3"/>
              <path d="M100 300 L200 150 L300 200 L350 100" stroke="#667eea" strokeWidth="4" fill="none"/>
              <circle cx="200" cy="150" r="8" fill="#667eea"/>
              <circle cx="300" cy="200" r="8" fill="#764ba2"/>
              <circle cx="350" cy="100" r="8" fill="#667eea"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea"/>
                  <stop offset="100%" stopColor="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          )}
        </Box>
        
        {title && (
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
        )}
        
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default AnimatedIllustration;