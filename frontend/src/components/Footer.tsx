import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Jewelry Shop
            </Typography>
            <Typography variant="body2">
              Elegant and timeless jewelry pieces for every occasion
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" sx={{ display: 'block', mb: 1 }}>Home</Link>
            <Link href="/products" color="inherit" sx={{ display: 'block', mb: 1 }}>Products</Link>
            <Link href="/login" color="inherit" sx={{ display: 'block', mb: 1 }}>Login</Link>
            <Link href="/register" color="inherit" sx={{ display: 'block' }}>Register</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" paragraph>
              123 Jewelry Lane
              <br />
              Diamond City, GD 12345
            </Typography>
            <Typography variant="body2">
              Email: info@jewelryshop.com
              <br />
              Phone: (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Jewelry Shop. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 