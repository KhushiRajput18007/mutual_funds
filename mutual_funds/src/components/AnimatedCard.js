'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { growthAnimation, investmentAnimation } from '@/data/lottieAnimations';

const AnimatedCard = ({ 
  title, 
  value, 
  subtitle, 
  animationData, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05 }}
    >
      <Card 
        sx={{ 
          background: gradient,
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 180
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {value}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            </Box>
            {animationData && (
              <Box sx={{ width: 80, height: 80 }}>
                <Lottie 
                  animationData={animationData} 
                  loop={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            )}
          </Box>
        </CardContent>
        
        {/* Geometric Pattern Overlay */}
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
    </motion.div>
  );
};

export default AnimatedCard;