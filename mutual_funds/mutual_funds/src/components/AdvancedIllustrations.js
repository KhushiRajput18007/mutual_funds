'use client';

import { motion, useTime, useTransform, useScroll, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Box, Typography, Card } from '@mui/material';

// Complex Financial Network Animation
export function FinancialNetworkAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const time = useTime();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const strokeDashOffset = useTransform(time, latest => -latest * 0.01);
  
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const rawConnections = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      Math.floor(Math.random() * 8)
    ).filter(c => c !== i);
    const connections = Array.from(new Set(rawConnections));

    return {
      id: i,
      x: 50 + (Math.cos((i * Math.PI * 2) / 8) * 35),
      y: 50 + (Math.sin((i * Math.PI * 2) / 8) * 35),
      size: 15 + Math.random() * 10,
      color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
      connections
    };
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: 400,
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.03))',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
        cursor: 'none'
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {/* Connection Lines */}
        {nodes.map((node, nodeIndex) => 
          node.connections
            .filter((targetId) => targetId > node.id) // ensure a single direction to avoid duplicates
            .map((targetId, connIndex) => {
              const targetNode = nodes[targetId];
              if (!targetNode) return null;
              
              return (
                <motion.line
                  key={`line-${nodeIndex}-${connIndex}-${node.id}-${targetId}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke="rgba(99, 102, 241, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
                  transition={{ duration: 2, delay: 0.5 + node.id * 0.1 }}
                  style={{
                    strokeDashoffset: strokeDashOffset,
                    filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.3))'
                  }}
                />
              );
            })
        )}

        {/* Data Flow Particles */}
        {nodes.map((node, nodeIndex) =>
          node.connections
            .filter((targetId) => targetId > node.id) // ensure single direction
            .map((targetId, connIndex) => {
              const targetNode = nodes[targetId];
              if (!targetNode) return null;
              
              return (
                <motion.circle
                  key={`particle-${nodeIndex}-${connIndex}-${node.id}-${targetId}`}
                  r="3"
                  fill={node.color}
                  initial={{ 
                    cx: `${node.x}%`,
                    cy: `${node.y}%`,
                    opacity: 0 
                  }}
                  animate={isInView ? {
                    cx: [`${node.x}%`, `${targetNode.x}%`],
                    cy: [`${node.y}%`, `${targetNode.y}%`],
                    opacity: [0, 1, 0]
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: node.id * 0.2,
                    ease: 'linear'
                  }}
                />
              );
            })
        )}

        {/* Network Nodes */}
        {nodes.map(node => (
          <motion.g key={node.id}>
            {/* Pulse Ring */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill="none"
              stroke={node.color}
              strokeWidth="2"
              opacity="0.4"
              animate={{
                r: [node.size, node.size + 10, node.size],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: node.id * 0.3
              }}
            />
            
            {/* Main Node */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size * 0.7}
              fill={node.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 + node.id * 0.1,
                type: 'spring',
                stiffness: 200
              }}
              whileHover={{ scale: 1.3, filter: 'drop-shadow(0 0 12px currentColor)' }}
              style={{
                cursor: 'pointer',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
              }}
            />
            
            {/* Node Label */}
            <motion.text
              x={`${node.x}%`}
              y={`${node.y + 8}%`}
              textAnchor="middle"
              fontSize="10"
              fill={node.color}
              fontWeight="600"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 1.2 + node.id * 0.1 }}
            >
              ${(node.id + 1) * 1.2}B
            </motion.text>
          </motion.g>
        ))}

        {/* Mouse Interaction Effect */}
        <motion.circle
          cx={`${mousePosition.x}%`}
          cy={`${mousePosition.y}%`}
          r="30"
          fill="none"
          stroke="rgba(99, 102, 241, 0.2)"
          strokeWidth="2"
          animate={{
            r: [30, 40, 30],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      </svg>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2 }}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '8px',
          color: 'white'
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
          Live Market Network
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', opacity: 0.8 }}>
          Real-time fund connections
        </Typography>
      </motion.div>
    </Box>
  );
}

// 3D Investment Growth Visualization
export function Investment3DVisualization() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const time = useTime();

  const data = [
    { year: '2020', value: 25, color: '#6366f1' },
    { year: '2021', value: 45, color: '#8b5cf6' },
    { year: '2022', value: 35, color: '#ec4899' },
    { year: '2023', value: 65, color: '#10b981' },
    { year: '2024', value: 85, color: '#f59e0b' }
  ];

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: 350,
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(99, 102, 241, 0.03))',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        overflow: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* 3D Grid Background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: useTransform(
            time,
            latest => `rotateX(60deg) rotateY(${(latest * 0.0001) % 360}deg)`
          ),
          transformOrigin: 'center bottom'
        }}
      />

      {/* 3D Bars */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          gap: '2%',
          padding: '5%',
          transformStyle: 'preserve-3d'
        }}
      >
        {data.map((item, i) => (
          <motion.div
            key={item.year}
            style={{
              width: '15%',
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center'
            }}
            initial={{ 
              height: 0,
              rotateY: -30,
              opacity: 0
            }}
            animate={isInView ? {
              height: `${item.value}%`,
              rotateY: 0,
              opacity: 1
            } : {}}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              type: 'spring',
              stiffness: 100
            }}
            whileHover={{
              scale: 1.1,
              rotateY: 15,
              z: 50
            }}
          >
            {/* Front Face */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${item.color}, ${item.color}aa)`,
                borderRadius: '4px 4px 0 0',
                border: `1px solid ${item.color}`,
                transformOrigin: 'bottom',
                backfaceVisibility: 'hidden'
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${item.color}44`,
                  `0 0 40px ${item.color}66`,
                  `0 0 20px ${item.color}44`
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />

            {/* Top Face */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '20px',
                background: `linear-gradient(45deg, ${item.color}dd, ${item.color}bb)`,
                borderRadius: '4px',
                transform: 'translateZ(10px) rotateX(90deg)',
                transformOrigin: 'bottom'
              }}
            />

            {/* Side Face */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '100%',
                background: `linear-gradient(90deg, ${item.color}bb, ${item.color}88)`,
                transform: 'translateZ(10px) rotateY(90deg)',
                transformOrigin: 'left'
              }}
            />

            {/* Value Label */}
            <motion.div
              style={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                background: `${item.color}22`,
                backdropFilter: 'blur(5px)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${item.color}44`,
                fontSize: '0.7rem',
                fontWeight: 600,
                color: item.color,
                whiteSpace: 'nowrap'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.5 + i * 0.1 }}
            >
              ₹{item.value}L
            </motion.div>

            {/* Year Label */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(148, 163, 184, 0.8)'
              }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 2 + i * 0.1 }}
            >
              {item.year}
            </motion.div>
          </motion.div>
        ))}
      </Box>

      {/* Floating Data Points */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: data[i % data.length].color,
            left: `${20 + i * 10}%`,
            top: `${20 + Math.sin(i) * 20}%`,
            filter: 'blur(0.5px)'
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4
          }}
        />
      ))}

      {/* Performance Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2.5, type: 'spring' }}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10b981'
          }}
        />
        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }}>
          +24.3% Growth
        </Typography>
      </motion.div>
    </Box>
  );
}

// Interactive Portfolio Sphere
export function PortfolioSphere() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]));
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]));

  const handleMouseMove = (e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) / rect.width);
      mouseY.set((e.clientY - centerY) / rect.height);
    }
  };

  const segments = [
    { label: 'Equity', value: 45, color: '#6366f1', angle: 0 },
    { label: 'Debt', value: 25, color: '#8b5cf6', angle: 162 },
    { label: 'Hybrid', value: 20, color: '#ec4899', angle: 252 },
    { label: 'Gold', value: 10, color: '#f59e0b', angle: 324 }
  ];

  return (
    <Box
      ref={ref}
      onMouseMove={handleMouseMove}
      sx={{
        width: '100%',
        height: 400,
        position: 'relative',
        borderRadius: 'var(--radius-2xl)',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05), transparent)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        overflow: 'hidden',
        perspective: '1200px',
        cursor: 'grab'
      }}
    >
      {/* Central Sphere */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 200,
          height: 200,
          marginTop: -100,
          marginLeft: -100,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #6366f1 0deg 162deg, #8b5cf6 162deg 252deg, #ec4899 252deg 324deg, #f59e0b 324deg 360deg)',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
      >
        {/* Sphere Highlight */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 60%)',
            mixBlendMode: 'overlay'
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        />

        {/* Inner Ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transform: 'translateZ(20px)'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>

      {/* Orbital Segments */}
      {segments.map((segment, i) => (
        <motion.div
          key={segment.label}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 300,
            height: 300,
            marginTop: -150,
            marginLeft: -150,
            border: `2px solid ${segment.color}44`,
            borderRadius: '50%',
            rotate: segment.angle
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { 
            scale: 1, 
            opacity: 0.6,
            rotate: segment.angle + 360
          } : {}}
          transition={{
            duration: 2,
            delay: i * 0.2,
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }
          }}
        >
          {/* Segment Indicator */}
          <motion.div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              width: 12,
              height: 12,
              marginLeft: -6,
              borderRadius: '50%',
              background: segment.color,
              boxShadow: `0 0 16px ${segment.color}88`
            }}
            animate={{
              scale: [1, 1.3, 1],
              boxShadow: [
                `0 0 16px ${segment.color}88`,
                `0 0 24px ${segment.color}bb`,
                `0 0 16px ${segment.color}88`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />

          {/* Label */}
          <motion.div
            style={{
              position: 'absolute',
              top: 30,
              left: '50%',
              transform: 'translateX(-50%)',
              background: `${segment.color}22`,
              backdropFilter: 'blur(5px)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${segment.color}44`,
              fontSize: '0.7rem',
              fontWeight: 600,
              color: segment.color,
              whiteSpace: 'nowrap'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.5 + i * 0.1 }}
          >
            {segment.label} {segment.value}%
          </motion.div>
        </motion.div>
      ))}

      {/* Center Value */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2, type: 'spring' }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: '#10b981',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            fontSize: '1.5rem'
          }}
        >
          ₹12.4L
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(148, 163, 184, 0.8)',
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        >
          Total Value
        </Typography>
      </motion.div>
    </Box>
  );
}