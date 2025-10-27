'use client';

import { motion, useScroll, useTransform, useTime } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';

// Floating Orbs with Physics
export function FloatingOrbs() {
  const time = useTime();
  const containerRef = useRef(null);
  
  const orbs = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 300 + 100,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    speed: Math.random() * 0.5 + 0.2,
    color: [
      'rgba(99, 102, 241, 0.03)',
      'rgba(139, 92, 246, 0.03)',
      'rgba(236, 72, 153, 0.03)',
      'rgba(16, 185, 129, 0.03)',
      'rgba(251, 191, 36, 0.03)'
    ][i % 5],
    blur: Math.random() * 20 + 10
  }));
  
  // Create individual transforms for each orb
  const orb0X = useTransform(time, (latest) => Math.sin(latest * orbs[0].speed * 0.001) * 200);
  const orb0Y = useTransform(time, (latest) => Math.cos(latest * orbs[0].speed * 0.001) * 150);
  const orb0Scale = useTransform(time, (latest) => 1 + Math.sin(latest * orbs[0].speed * 0.002) * 0.2);
  const orb0Opacity = useTransform(time, (latest) => 0.3 + Math.sin(latest * orbs[0].speed * 0.003) * 0.2);
  
  const orb1X = useTransform(time, (latest) => Math.sin(latest * orbs[1].speed * 0.001) * 200);
  const orb1Y = useTransform(time, (latest) => Math.cos(latest * orbs[1].speed * 0.001) * 150);
  const orb1Scale = useTransform(time, (latest) => 1 + Math.sin(latest * orbs[1].speed * 0.002) * 0.2);
  const orb1Opacity = useTransform(time, (latest) => 0.3 + Math.sin(latest * orbs[1].speed * 0.003) * 0.2);
  
  // Create a simpler approach with fewer orbs to avoid the complex mapping
  const orbTransforms = [
    { x: orb0X, y: orb0Y, scale: orb0Scale, opacity: orb0Opacity },
    { x: orb1X, y: orb1Y, scale: orb1Scale, opacity: orb1Opacity }
  ];

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -2
      }}
    >
      {orbs.slice(0, 2).map((orb, i) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            x: orbTransforms[i].x,
            y: orbTransforms[i].y,
            scale: orbTransforms[i].scale,
            opacity: orbTransforms[i].opacity
          }}
        />
      ))}
      {/* Static orbs for the rest */}
      {orbs.slice(2).map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            left: `${orb.initialX}%`,
            top: `${orb.initialY}%`,
            opacity: 0.3
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: orb.id * 0.3
          }}
        />
      ))}
    </Box>
  );
}

// Dynamic Gradient Mesh
export function GradientMesh() {
  const time = useTime();
  
  const mesh1Transform = useTransform(time, (latest) => `translate(${Math.sin(latest * 0.0008) * 100}px, ${Math.cos(latest * 0.0008) * 50}px)`);
  const mesh2Transform = useTransform(time, (latest) => `translate(${Math.cos(latest * 0.0006) * -80}px, ${Math.sin(latest * 0.0006) * 60}px)`);
  const mesh3Transform = useTransform(time, (latest) => `translate(${Math.sin(latest * 0.0010) * 60}px, ${Math.cos(latest * 0.0010) * -40}px)`);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -3
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
          transform: mesh1Transform
        }}
      />
      
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)',
          transform: mesh2Transform
        }}
      />
      
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.06) 0%, transparent 40%)',
          transform: mesh3Transform
        }}
      />
    </Box>
  );
}

// Particle System
export function ParticleSystem() {
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const generateParticles = () => {
      return Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: [
          'rgba(99, 102, 241, 0.4)',
          'rgba(139, 92, 246, 0.4)',
          'rgba(236, 72, 153, 0.4)',
          'rgba(16, 185, 129, 0.4)'
        ][Math.floor(Math.random() * 4)]
      }));
    };

    setParticles(generateParticles());

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        x: particle.x > window.innerWidth ? 0 : particle.x < 0 ? window.innerWidth : particle.x,
        y: particle.y > window.innerHeight ? 0 : particle.y < 0 ? window.innerHeight : particle.y
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: particle.color,
            opacity: particle.opacity,
            filter: 'blur(0.5px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </Box>
  );
}

// Scroll-based Aurora Effect
export function AuroraEffect() {
  const { scrollYProgress } = useScroll();
  const time = useTime();
  const rotationDegrees = useTransform(time, latest => (latest * 0.0002) % 360);
  const auroraOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.9]);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -4,
        overflow: 'hidden'
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: '-50%',
          filter: 'blur(50px)',
          opacity: auroraOpacity,
          rotate: rotationDegrees,
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(99, 102, 241, 0.02) 0deg,
              rgba(139, 92, 246, 0.03) 60deg,
              rgba(236, 72, 153, 0.02) 120deg,
              rgba(16, 185, 129, 0.01) 180deg,
              rgba(251, 191, 36, 0.02) 240deg,
              rgba(99, 102, 241, 0.02) 300deg,
              rgba(99, 102, 241, 0.02) 360deg
            )
          `
        }}
      />
    </Box>
  );
}

// Interactive Grid Pattern
export function InteractiveGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -5,
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        opacity: 0.3
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          filter: 'blur(20px)'
        }}
        animate={{
          left: mousePos.x - 200,
          top: mousePos.y - 200
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 100
        }}
      />
    </Box>
  );
}

// Combined Ambient Background Component
export default function AmbientBackground() {
  return (
    <>
      <InteractiveGrid />
      <AuroraEffect />
      <GradientMesh />
      <FloatingOrbs />
      <ParticleSystem />
    </>
  );
}