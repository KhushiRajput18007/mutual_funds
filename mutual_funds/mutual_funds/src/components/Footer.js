'use client';

import { useState } from 'react';
import {
  Box, Container, Grid, Typography, Stack, Button, TextField, 
  IconButton, Divider, Chip, Card, Alert, Snackbar, Link as MuiLink
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  TrendingUp, Twitter, LinkedIn, GitHub, Instagram, Email,
  Phone, LocationOn, Send, Newspaper, ArrowUpward,
  Security, Speed, Analytics, Support
} from '@mui/icons-material';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState({ open: false, message: '', severity: 'success' });
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      // Simulate newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsletter({ 
        open: true, 
        message: 'Successfully subscribed to newsletter!', 
        severity: 'success' 
      });
      setEmail('');
    } catch {
      setNewsletter({ 
        open: true, 
        message: 'Failed to subscribe. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Explore Funds', path: '/funds' },
    { label: 'Compare Funds', path: '/compare' },
    { label: 'Active Funds', path: '/active-funds' },
    { label: 'Trending Funds', path: '/trending-funds' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Watchlist', path: '/watchlist' }
  ];

  const resources = [
    { label: 'Investment Guide', path: '/wealth-guide' },
    { label: 'SIP Calculator', path: '/calculators/sip' },
    { label: 'Tax Planning', path: '/tax-planning' },
    { label: 'Risk Assessment', path: '/risk-assessment' },
    { label: 'Market Insights', path: '/insights' },
    { label: 'Help Center', path: '/help' }
  ];

  const company = [
    { label: 'About Us', path: '/about' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Contact', path: '/contact' },
    { label: 'Careers', path: '/careers' },
    { label: 'Blog', path: '/blog' }
  ];

  const features = [
    { 
      icon: <Security />, 
      title: 'SEBI Compliant', 
      desc: 'Fully regulated platform' 
    },
    { 
      icon: <Speed />, 
      title: 'Real-time Data', 
      desc: 'Live NAV updates' 
    },
    { 
      icon: <Analytics />, 
      title: 'Advanced Analytics', 
      desc: 'Professional tools' 
    },
    { 
      icon: <Support />, 
      title: '24/7 Support', 
      desc: 'Always here to help' 
    }
  ];

  return (
    <>
      <Snackbar
        open={newsletter.open}
        autoHideDuration={4000}
        onClose={() => setNewsletter({ ...newsletter, open: false })}
      >
        <Alert 
          severity={newsletter.severity} 
          onClose={() => setNewsletter({ ...newsletter, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {newsletter.message}
        </Alert>
      </Snackbar>

      <Box
        ref={footerRef}
        component="footer"
        sx={{
          position: 'relative',
          mt: 'auto',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background Elements */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${
                  ['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.12)', 'rgba(236, 72, 153, 0.1)'][i % 3]
                }, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.8
              }}
            />
          ))}

          {/* Grid pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.4
            }}
          />
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: { xs: 6, md: 8 } }}>
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card
              className="glass-card"
              sx={{
                mb: 6,
                px: { xs: 3, md: 5 },
                py: { xs: 4, md: 5 },
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-2xl)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 60%)',
                  opacity: 0.6
                }}
              />
              
              <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Why Choose MF Explorer?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Join thousands of investors who trust our platform for professional mutual fund analytics and investment guidance.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={feature.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 3,
                          borderRadius: 'var(--radius-lg)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                            mb: 2,
                            color: 'primary.main'
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.desc}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </motion.div>

          {/* Main Footer Content */}
          <Grid container spacing={6}>
            {/* Company Info & Newsletter */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Stack spacing={3}>
                  {/* Logo & Description */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <TrendingUp sx={{ mr: 1.5, color: 'primary.main', fontSize: '2rem' }} />
                      </motion.div>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        MF Explorer
                      </Typography>
                      <Chip 
                        label="Beta" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1.5, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      India&apos;s most comprehensive mutual fund analytics platform. Make informed investment decisions with professional-grade tools and real-time insights.
                    </Typography>
                  </Box>

                  {/* Newsletter Signup */}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Newspaper sx={{ mr: 1, color: 'primary.main' }} />
                      Stay Updated
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Get weekly market insights and fund recommendations delivered to your inbox.
                    </Typography>
                    <Box component="form" onSubmit={handleNewsletterSubmit}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          placeholder="Enter your email"
                          variant="outlined"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          size="small"
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)'
                              }
                            }
                          }}
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            endIcon={<Send />}
                            sx={{
                              borderRadius: 2,
                              px: 3,
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5856eb, #7c3aed)'
                              }
                            }}
                          >
                            Subscribe
                          </Button>
                        </motion.div>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Contact Info */}
                  <Stack spacing={1.5}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Contact</Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 2, color: 'text.secondary', fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          hello@mfexplorer.in
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 2, color: 'text.secondary', fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          +91 98765 43210
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 2, color: 'text.secondary', fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          Mumbai, India
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </motion.div>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2.5}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                  Quick Links
                </Typography>
                <Stack spacing={2}>
                  {quickLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <MuiLink
                        component={Link}
                        href={link.path}
                        underline="none"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          display: 'block',
                          padding: '4px 0',
                          '&:hover': {
                            color: 'primary.main',
                            paddingLeft: 1
                          }
                        }}
                      >
                        {link.label}
                      </MuiLink>
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Resources */}
            <Grid item xs={12} sm={6} md={2.5}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                  Resources
                </Typography>
                <Stack spacing={2}>
                  {resources.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <MuiLink
                        component={Link}
                        href={link.path}
                        underline="none"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          display: 'block',
                          padding: '4px 0',
                          '&:hover': {
                            color: 'primary.main',
                            paddingLeft: 1
                          }
                        }}
                      >
                        {link.label}
                      </MuiLink>
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            {/* Company */}
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                  Company
                </Typography>
                <Stack spacing={2}>
                  {company.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 8, scale: 1.05 }}
                    >
                      <MuiLink
                        component={Link}
                        href={link.path}
                        underline="none"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          display: 'block',
                          padding: '4px 0',
                          '&:hover': {
                            color: 'primary.main',
                            paddingLeft: 1
                          }
                        }}
                      >
                        {link.label}
                      </MuiLink>
                    </motion.div>
                  ))}
                </Stack>

                {/* Social Links */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                    Follow Us
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { icon: <Twitter />, color: '#1DA1F2', label: 'Twitter' },
                      { icon: <LinkedIn />, color: '#0077B5', label: 'LinkedIn' },
                      { icon: <GitHub />, color: '#333', label: 'GitHub' },
                      { icon: <Instagram />, color: '#E4405F', label: 'Instagram' }
                    ].map((social, index) => (
                      <motion.div
                        key={social.label}
                        whileHover={{ scale: 1.2, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconButton
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: `${social.color}20`,
                              borderColor: social.color,
                              color: social.color
                            }
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          {/* Divider */}
          <Divider sx={{ my: 6, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

          {/* Footer Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={6}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1, sm: 4 }}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    © 2024 MF Explorer. All rights reserved.
                  </Typography>
                  <Stack direction="row" spacing={2} divider={<Box sx={{ width: 1, height: 1, bgcolor: 'text.secondary', opacity: 0.3 }} />}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      SEBI Registered
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      AMFI Compliant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      SSL Secured
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={scrollToTop}
                    variant="outlined"
                    startIcon={<ArrowUpward />}
                    sx={{
                      borderRadius: 3,
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      color: 'primary.main',
                      background: 'rgba(99, 102, 241, 0.08)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        background: 'rgba(99, 102, 241, 0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Back to Top
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}