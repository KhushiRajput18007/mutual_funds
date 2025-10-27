'use client';

import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Card } from '@mui/material';
import {
  TrendingUp, AccountBalance, PieChart, ShowChart, 
  MonetizationOn, Timeline, BarChart, Assessment
} from '@mui/icons-material';

// Floating Investment Orbs Animation
export function FloatingInvestmentOrbs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const orbs = [
    { icon: <AccountBalance />, color: '#6366f1', label: 'Banks', size: 80, delay: 0 },
    { icon: <ShowChart />, color: '#10b981', label: 'Growth', size: 60, delay: 0.2 },
    { icon: <PieChart />, color: '#ec4899', label: 'Balanced', size: 70, delay: 0.4 },
    { icon: <Timeline />, color: '#f59e0b', label: 'Index', size: 55, delay: 0.6 },
    { icon: <BarChart />, color: '#8b5cf6', label: 'Value', size: 65, delay: 0.8 }
  ];

  return (
    <Box 
      ref={ref}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: { xs: 300, md: 400 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {orbs.map((orb, index) => (
        <motion.div
          key={orb.label}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}33, ${orb.color}11)`,
            border: `2px solid ${orb.color}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            boxShadow: `0 10px 30px ${orb.color}44`
          }}
          initial={{ 
            scale: 0, 
            opacity: 0,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100
          }}
          animate={isInView ? {
            scale: 1,
            opacity: 1,
            x: [null, Math.sin(index * 1.2) * 120],
            y: [null, Math.cos(index * 1.2) * 80]
          } : {}}
          transition={{
            scale: { duration: 0.8, delay: orb.delay },
            opacity: { duration: 0.8, delay: orb.delay },
            x: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: orb.delay },
            y: { duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: orb.delay + 1 }
          }}
          whileHover={{ scale: 1.2, y: -10 }}
          whileTap={{ scale: 0.9 }}
        >
          <Box sx={{ color: orb.color, fontSize: '1.5rem' }}>
            {orb.icon}
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: -25, 
              fontSize: '0.7rem', 
              fontWeight: 600,
              color: orb.color,
              textAlign: 'center',
              width: '100%'
            }}
          >
            {orb.label}
          </Typography>
        </motion.div>
      ))}

      {/* Connection Lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {orbs.map((_, i) => 
          orbs.slice(i + 1).map((_, j) => (
            <motion.line
              key={`${i}-${j + i + 1}`}
              x1="50%"
              y1="50%"
              x2="50%"
              y2="50%"
              stroke="rgba(99, 102, 241, 0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 2, delay: 1.5 + i * 0.2 }}
            />
          ))
        )}
      </svg>
    </Box>
  );
}

// Growth Chart Animation
export function GrowthChartAnimation({ data = [20, 35, 45, 40, 60, 75, 85, 70, 90, 95] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  return (
    <Box 
      ref={ref}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: 200,
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        p: 3,
        overflow: 'hidden'
      }}
    >
      {/* Grid Lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1="10%"
            y1={`${20 + i * 15}%`}
            x2="90%"
            y2={`${20 + i * 15}%`}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.5 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Chart Bars */}
      <Box sx={{ display: 'flex', alignItems: 'end', height: '100%', gap: 1, pt: 2, pb: 3 }}>
        {data.map((value, i) => (
          <motion.div
            key={i}
            style={{
              flex: 1,
              background: `linear-gradient(to top, hsl(${240 + i * 15}, 70%, 60%), hsl(${240 + i * 15}, 70%, 80%))`,
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={isInView ? { 
              height: `${value}%`, 
              opacity: 1 
            } : {}}
            transition={{ 
              duration: 1, 
              delay: i * 0.1,
              type: 'spring',
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            {/* Value Label */}
            <motion.div
              style={{
                position: 'absolute',
                top: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 1.5 + i * 0.1 }}
            >
              ₹{(value * 1000).toLocaleString()}
            </motion.div>
          </motion.div>
        ))}
      </Box>

      {/* Trend Line */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <motion.path
          d={`M 10 ${100 - data[0]}${data.slice(1).map((val, i) => 
            ` L ${10 + (i + 1) * (80 / (data.length - 1))} ${100 - val}`
          ).join('')}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
        />
      </svg>

      {/* Title */}
      <Typography 
        variant="h6" 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 15, 
          fontWeight: 700,
          color: 'primary.main',
          fontSize: '0.9rem'
        }}
      >
        Portfolio Growth
      </Typography>
    </Box>
  );
}

// Interactive SIP Calculator Visual
export function SIPCalculatorVisual({ monthlyAmount = 5000, years = 10, expectedReturn = 12 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const totalInvested = monthlyAmount * 12 * years;
  const futureValue = monthlyAmount * (((Math.pow(1 + expectedReturn/100/12, 12 * years) - 1) / (expectedReturn/100/12)) * (1 + expectedReturn/100/12));
  const returns = futureValue - totalInvested;
  
  const segments = [
    { label: 'Invested', value: totalInvested, color: '#6366f1', angle: 0 },
    { label: 'Returns', value: returns, color: '#10b981', angle: (totalInvested / futureValue) * 360 }
  ];

  return (
    <Card
      ref={ref}
      className="glass-card"
      sx={{ 
        p: 4, 
        height: 350,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        SIP Growth Visualization
      </Typography>

      {/* Circular Progress */}
      <Box sx={{ position: 'relative', width: 200, height: 200, mb: 3 }}>
        <svg width="200" height="200" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="8"
          />
          
          {/* Invested Amount Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#6366f1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={2 * Math.PI * 80}
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={isInView ? { 
              strokeDashoffset: 2 * Math.PI * 80 * (1 - totalInvested / futureValue) 
            } : {}}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
          
          {/* Returns Arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80 * (returns / futureValue)} ${2 * Math.PI * 80}`}
            strokeDashoffset={-2 * Math.PI * 80 * (totalInvested / futureValue)}
            initial={{ strokeDashoffset: 0 }}
            animate={isInView ? { 
              strokeDashoffset: -2 * Math.PI * 80 * (totalInvested / futureValue) 
            } : {}}
            transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
          />
        </svg>

        {/* Center Value */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', textAlign: 'center' }}>
              ₹{Math.round(futureValue).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Final Value
            </Typography>
          </motion.div>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {segments.map((segment, i) => (
          <motion.div
            key={segment.label}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.2 + i * 0.2 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: segment.color,
                boxShadow: `0 0 10px ${segment.color}66`
              }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                {segment.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: segment.color }}>
                ₹{Math.round(segment.value).toLocaleString()}
              </Typography>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Card>
  );
}

// Investment Journey Timeline
export function InvestmentJourney() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const steps = [
    { 
      title: 'Start Your Journey', 
      desc: 'Begin with SIP investments', 
      icon: <MonetizationOn />,
      color: '#6366f1',
      year: 'Year 1'
    },
    { 
      title: 'Diversify Portfolio', 
      desc: 'Add different fund categories', 
      icon: <PieChart />,
      color: '#8b5cf6',
      year: 'Year 3'
    },
    { 
      title: 'Review & Rebalance', 
      desc: 'Optimize your allocations', 
      icon: <Assessment />,
      color: '#ec4899',
      year: 'Year 5'
    },
    { 
      title: 'Achieve Financial Goals', 
      desc: 'Reach your wealth targets', 
      icon: <TrendingUp />,
      color: '#10b981',
      year: 'Year 10'
    }
  ];

  return (
    <Box ref={ref} sx={{ py: 4, position: 'relative' }}>
      {/* Timeline Line */}
      <Box
        sx={{
          position: 'absolute',
          left: { xs: '30px', md: '50%' },
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #6366f1, #8b5cf6, #ec4899, #10b981)',
          transform: { md: 'translateX(-50%)' }
        }}
      />

      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: index * 0.3 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 6,
              flexDirection: { xs: 'row', md: index % 2 === 0 ? 'row' : 'row-reverse' },
              pl: { xs: '80px', md: 0 }
            }}
          >
            {/* Timeline Node */}
            <Box
              sx={{
                position: 'absolute',
                left: { xs: '30px', md: '50%' },
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${step.color}, ${step.color}aa)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.2rem',
                boxShadow: `0 0 20px ${step.color}66`,
                zIndex: 2,
                transform: { md: 'translateX(-50%)' },
                border: '3px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {step.icon}
            </Box>

            {/* Content Card */}
            <Card
              className="glass-card"
              sx={{
                p: 3,
                flex: 1,
                ml: { xs: 0, md: index % 2 === 0 ? 6 : 0 },
                mr: { xs: 0, md: index % 2 === 0 ? 0 : 6 },
                maxWidth: { md: '40%' },
                position: 'relative',
                background: `rgba(${step.color.slice(1).match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.08)`,
                border: `1px solid ${step.color}44`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ 
                  background: step.color, 
                  color: 'white', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  {step.year}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: step.color, mb: 1 }}>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.desc}
              </Typography>

              {/* Arrow connector */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  [index % 2 === 0 ? 'left' : 'right']: { md: -15 },
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  [index % 2 === 0 ? 'borderRight' : 'borderLeft']: { md: `12px solid ${step.color}44` },
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Card>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}

// Animated Counter Component
export function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.onChange((latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}