'use client';

import { Card, CardContent, Typography, Box, IconButton, Tooltip, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useTheme } from '@mui/material/styles';

const EnhancedAnimatedCard = ({ 
  title, 
  subtitle,
  value, 
  change,
  changePercent,
  category,
  isBookmarked = false,
  onBookmarkToggle,
  onClick,
  delay = 0,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarkHovered, setIsBookmarkHovered] = useState(false);
  const theme = useTheme();
  
  const isPositiveChange = change && change >= 0;
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: delay + (index * 0.1)
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: delay + 0.2 + (index * 0.1),
        duration: 0.6
      }
    }
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 2,
        ease: "linear",
        delay: delay + (index * 0.3)
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      <Card 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          minHeight: 200,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(150%)',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.08)'}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
              : '0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }}
        onClick={onClick}
      >
        {/* Shimmer effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>

        <CardContent sx={{ p: 3, height: '100%', position: 'relative', zIndex: 2 }}>
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header with bookmark */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1, mr: 1 }}>
                {category && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.4 + (index * 0.1) }}
                  >
                    <Chip 
                      label={category} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        mb: 1,
                        fontSize: '0.7rem',
                        height: 20,
                        borderRadius: 2
                      }} 
                    />
                  </motion.div>
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    lineHeight: 1.3,
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {onBookmarkToggle && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip title={isBookmarked ? "Remove from watchlist" : "Add to watchlist"}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmarkToggle();
                      }}
                      onMouseEnter={() => setIsBookmarkHovered(true)}
                      onMouseLeave={() => setIsBookmarkHovered(false)}
                      sx={{
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.08)',
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: isBookmarkHovered ? 1.2 : 1,
                          rotate: isBookmarked ? 0 : 15
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {isBookmarked ? (
                          <BookmarkIcon 
                            fontSize="small" 
                            sx={{ color: 'primary.main' }} 
                          />
                        ) : (
                          <BookmarkAddOutlinedIcon 
                            fontSize="small" 
                          />
                        )}
                      </motion.div>
                    </IconButton>
                  </Tooltip>
                </motion.div>
              )}
            </Box>

            {/* Value and change section */}
            {value && (
              <Box sx={{ mt: 'auto' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: delay + 0.3 + (index * 0.1) }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      mb: change ? 0.5 : 0,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {value}
                  </Typography>
                </motion.div>

                {change && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: delay + 0.4 + (index * 0.1) }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <motion.div
                        animate={{ 
                          rotate: isPositiveChange ? 0 : 180,
                          color: isPositiveChange ? theme.palette.success.main : theme.palette.error.main
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <TrendingUpIcon fontSize="small" />
                      </motion.div>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: isPositiveChange ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {Math.abs(change).toFixed(2)}
                        {changePercent && ` (${Math.abs(changePercent).toFixed(2)}%)`}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </Box>
            )}
          </motion.div>
        </CardContent>

        {/* Floating elements for visual interest */}
        <motion.div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
            borderRadius: '50%',
            zIndex: 0
          }}
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.8 : 0.4
          }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        <motion.div
          style={{
            position: 'absolute',
            bottom: -10,
            left: -10,
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.primary.main}15)`,
            borderRadius: '50%',
            zIndex: 0
          }}
          animate={{
            scale: isHovered ? 1.3 : 1,
            opacity: isHovered ? 0.6 : 0.3
          }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        />
      </Card>
    </motion.div>
  );
};

export default EnhancedAnimatedCard;