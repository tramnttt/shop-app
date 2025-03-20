import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Person, Edit, Lock, Inventory } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Mock order data
const mockOrders = [
  {
    id: 1,
    orderNumber: "ORD-2023-001",
    date: "2023-10-15",
    total: 256.98,
    status: "Delivered",
    items: [
      { id: 1, name: "Diamond Pendant", price: 129.99, quantity: 1 },
      { id: 2, name: "Gold Hoop Earrings", price: 63.50, quantity: 2 }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD-2023-002",
    date: "2023-11-20",
    total: 189.99,
    status: "Processing",
    items: [
      { id: 3, name: "Silver Charm Bracelet", price: 89.99, quantity: 1 },
      { id: 4, name: "Pearl Necklace", price: 100.00, quantity: 1 }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD-2023-003",
    date: "2023-12-05",
    total: 349.50,
    status: "Shipped",
    items: [
      { id: 5, name: "Diamond Stud Earrings", price: 349.50, quantity: 1 }
    ]
  }
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    if (user) {
      setFormData({
        ...formData,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: ''
      });
    }
  }, [user, isAuthenticated, navigate, formData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (tabValue === 1 && isEditing) { // Password change validation
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (!formData.newPassword) errors.newPassword = 'New password is required';
      if (formData.newPassword && formData.newPassword.length < 8) 
        errors.newPassword = 'Password must be at least 8 characters';
      if (formData.newPassword !== formData.confirmPassword) 
        errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Here you would typically call an API to update the user profile
    setIsLoading(true);
    console.log('Updating profile with:', formData);
    
    // Mock successful update
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      // Show success message or update UI
    }, 1000);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        My Account
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main' 
              }}
            >
              <Person sx={{ fontSize: 60 }} />
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Member since {new Date().toLocaleDateString()}
            </Typography>
            
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth 
              onClick={logout}
            >
              Log Out
            </Button>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              variant="fullWidth"
            >
              <Tab icon={<Person />} label="PERSONAL INFO" />
              <Tab icon={<Lock />} label="PASSWORD" />
              <Tab icon={<Inventory />} label="ORDER HISTORY" />
            </Tabs>

            {/* Personal Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleUpdateProfile}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Personal Information</Typography>
                  <Button 
                    startIcon={<Edit />}
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      margin="normal"
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Button 
                    type="submit"
                    variant="contained" 
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Save Changes
                  </Button>
                )}
              </Box>
            </TabPanel>

            {/* Password Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleUpdateProfile}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Change Password</Typography>
                  <Button 
                    startIcon={<Edit />}
                    onClick={handleEditToggle}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>

                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                  error={!!formErrors.currentPassword}
                  helperText={formErrors.currentPassword}
                />
                
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                  error={!!formErrors.newPassword}
                  helperText={formErrors.newPassword}
                />
                
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  margin="normal"
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                />

                {isEditing && (
                  <Button 
                    type="submit"
                    variant="contained" 
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Update Password
                  </Button>
                )}
              </Box>
            </TabPanel>

            {/* Order History Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Your Order History
              </Typography>
              
              {mockOrders.length === 0 ? (
                <Alert severity="info">
                  You haven't placed any orders yet.
                </Alert>
              ) : (
                <Box>
                  {mockOrders.map((order) => (
                    <Card key={order.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">
                              Order #{order.orderNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Placed on {order.date}
                            </Typography>
                          </Box>
                          <Box>
                            <Chip 
                              label={order.status} 
                              color={
                                order.status === 'Delivered' ? 'success' : 
                                order.status === 'Shipped' ? 'primary' : 'warning'
                              }
                            />
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        {order.items.map((item) => (
                          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                            <Typography>
                              {item.name} x{item.quantity}
                            </Typography>
                            <Typography fontWeight="bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="h6">
                            Total
                          </Typography>
                          <Typography variant="h6">
                            ${order.total.toFixed(2)}
                          </Typography>
                        </Box>
                        
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          fullWidth
                        >
                          View Order Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 