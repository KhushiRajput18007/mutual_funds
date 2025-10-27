'use client';

import { Box, Card, CardContent, Skeleton, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
    },
  }),
};

export const CardSkeleton = ({ index = 0 }) => {
  const theme = useTheme();

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
    >
      <Card
        sx={{
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          variants={shimmerVariants}
          animate="animate"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
            zIndex: 1,
          }}
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, mr: 1 }}>
              <Skeleton
                variant="rectangular"
                width={60}
                height={16}
                sx={{ mb: 1, borderRadius: 1 }}
                animation="pulse"
              />
              <Skeleton
                variant="text"
                width="85%"
                height={24}
                sx={{ mb: 0.5 }}
                animation="pulse"
              />
              <Skeleton
                variant="text"
                width="65%"
                height={20}
                sx={{ mb: 1 }}
                animation="pulse"
              />
            </Box>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              animation="pulse"
            />
          </Box>
          
          <Box sx={{ mt: 'auto' }}>
            <Skeleton
              variant="text"
              width="40%"
              height={28}
              sx={{ mb: 0.5 }}
              animation="pulse"
            />
            <Skeleton
              variant="text"
              width="60%"
              height={20}
              animation="pulse"
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const GridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid key={index} item xs={12} sm={6} md={3}>
        <CardSkeleton index={index} />
      </Grid>
    ))}
  </Grid>
);

export const HeroSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Grid container spacing={6} alignItems="center">
      <Grid item xs={12} md={6}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 3 }}>
            <Skeleton
              variant="text"
              width={120}
              height={16}
              sx={{ mb: 2 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="90%"
              height={60}
              sx={{ mb: 1 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="80%"
              height={60}
              sx={{ mb: 2 }}
              animation="wave"
            />
            <Skeleton
              variant="text"
              width="95%"
              height={24}
              sx={{ mb: 3 }}
              animation="wave"
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton
                variant="rectangular"
                width={140}
                height={48}
                sx={{ borderRadius: 3 }}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={140}
                height={48}
                sx={{ borderRadius: 3 }}
                animation="wave"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton
                variant="rectangular"
                width={100}
                height={24}
                sx={{ borderRadius: 2 }}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={120}
                height={24}
                sx={{ borderRadius: 2 }}
                animation="wave"
              />
              <Skeleton
                variant="rectangular"
                width={80}
                height={24}
                sx={{ borderRadius: 2 }}
                animation="wave"
              />
            </Box>
          </Box>
        </motion.div>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ 
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)'
            }}
            animation="wave"
          />
        </motion.div>
      </Grid>
    </Grid>
  );
};

export const ListSkeleton = ({ count = 6 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Skeleton variant="text" width={80} height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={60} height={16} />
            </Box>
          </Box>
        </Card>
      </motion.div>
    ))}
  </Box>
);

export const EmptyState = ({ 
  title = "No data available", 
  description = "There's nothing to show here right now.",
  icon: Icon,
  action
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          px: 4,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              border: `2px solid ${theme.palette.primary.main}20`
            }}
          >
            {Icon && (
              <Icon
                sx={{
                  fontSize: 48,
                  color: 'primary.main',
                  opacity: 0.7
                }}
              />
            )}
          </Box>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400 }}
          >
            {description}
          </Typography>
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              {action}
            </motion.div>
          )}
        </motion.div>
      </Box>
    </motion.div>
  );
};