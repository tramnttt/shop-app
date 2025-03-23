import React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    Container,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Chip,
    Badge
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Logout, 
    Settings, 
    Person, 
    Dashboard, 
    CategoryOutlined, 
    Inventory, 
    AdminPanelSettings 
} from '@mui/icons-material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

export const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [adminMenuAnchorEl, setAdminMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const adminMenuOpen = Boolean(adminMenuAnchorEl);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mobileMenu, setMobileMenu] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAdminMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAdminMenuAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAdminMenuClose = () => {
        setAdminMenuAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (!user) return '?';
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenu(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenu(null);
    };

    const isAdmin = user?.role === 'admin';

    const navigationItems = [
        { label: 'Home', path: '/' },
        { label: 'Products', path: '/products' }
    ];

    const adminNavigationItems = [
        { label: 'Categories', path: '/admin/categories', icon: <CategoryOutlined fontSize="small" /> },
        { label: 'Products', path: '/admin/products', icon: <Inventory fontSize="small" /> }
    ];

    return (
        <AppBar position="sticky">
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 4,
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                            flexGrow: { xs: 1, md: 0 }
                        }}
                    >
                        Jewelry Shop
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMobileMenuOpen}
                                sx={{ display: { xs: 'flex', md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={mobileMenu}
                                open={Boolean(mobileMenu)}
                                onClose={handleMobileMenuClose}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                            >
                                {navigationItems.map((item) => (
                                    <MenuItem
                                        key={item.path}
                                        component={RouterLink}
                                        to={item.path}
                                        onClick={handleMobileMenuClose}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                                
                                {isAdmin && (
                                    <>
                                        <Divider />
                                        <Typography 
                                            color="text.secondary" 
                                            sx={{ px: 2, py: 1, fontSize: '0.875rem' }}
                                        >
                                            Admin
                                        </Typography>
                                        {adminNavigationItems.map((item) => (
                                            <MenuItem
                                                key={item.path}
                                                component={RouterLink}
                                                to={item.path}
                                                onClick={handleMobileMenuClose}
                                            >
                                                <ListItemIcon>
                                                    {item.icon}
                                                </ListItemIcon>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </>
                                )}
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    component={RouterLink}
                                    to={item.path}
                                    color="inherit"
                                >
                                    {item.label}
                                </Button>
                            ))}

                            {isAdmin && (
                                <>
                                    <Button
                                        color="inherit"
                                        onClick={handleAdminMenuClick}
                                        endIcon={
                                            <Badge color="error">
                                                <AdminPanelSettings />
                                            </Badge>
                                        }
                                        sx={{ ml: 1 }}
                                    >
                                        Admin
                                    </Button>
                                    <Menu
                                        anchorEl={adminMenuAnchorEl}
                                        open={adminMenuOpen}
                                        onClose={handleAdminMenuClose}
                                        onClick={handleAdminMenuClose}
                                        PaperProps={{
                                            elevation: 0,
                                            sx: {
                                                overflow: 'visible',
                                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                mt: 1.5
                                            },
                                        }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        {adminNavigationItems.map((item) => (
                                            <MenuItem 
                                                key={item.path} 
                                                component={RouterLink} 
                                                to={item.path}
                                            >
                                                <ListItemIcon>
                                                    {item.icon}
                                                </ListItemIcon>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </>
                            )}
                        </Box>
                    )}

                    <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

                    {isAuthenticated ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 1 }}>
                                {isAdmin && !isMobile && (
                                    <Chip
                                        label="Admin"
                                        color="secondary"
                                        size="small"
                                        sx={{ mr: 2 }}
                                    />
                                )}
                            </Box>
                            <IconButton
                                onClick={handleClick}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={open ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? 'error.main' : 'secondary.main' }}>
                                    {getInitials()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                id="account-menu"
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                        mt: 1.5,
                                        '& .MuiAvatar-root': {
                                            width: 32,
                                            height: 32,
                                            ml: -0.5,
                                            mr: 1,
                                        },
                                        '&:before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem>
                                    <ListItemIcon>
                                        <Person fontSize="small" />
                                    </ListItemIcon>
                                    <Box>
                                        <Typography variant="body2">{user?.firstName} {user?.lastName}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                                    </Box>
                                </MenuItem>
                                <Divider />
                                {isAdmin && (
                                    <MenuItem component={RouterLink} to="/admin">
                                        <ListItemIcon>
                                            <Dashboard fontSize="small" />
                                        </ListItemIcon>
                                        Admin Dashboard
                                    </MenuItem>
                                )}
                                <MenuItem component={RouterLink} to="/profile">
                                    <ListItemIcon>
                                        <Settings fontSize="small" />
                                    </ListItemIcon>
                                    Settings
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/register"
                            >
                                Register
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header; 