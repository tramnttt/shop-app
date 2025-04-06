import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';
import BasketPage from './pages/BasketPage';
import CheckoutPage from './pages/CheckoutPage';
import VietQRPaymentPage from './pages/VietQRPaymentPage';
import MoMoPaymentPage from './pages/MoMoPaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrdersPage from './pages/OrdersPage';
import { useAuth } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#8A6F3E', // Elegant gold/bronze
            light: '#B09D78',
            dark: '#6A532B',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#5D4356', // Rich burgundy/purple
            light: '#7C627A',
            dark: '#3D2A38',
            contrastText: '#ffffff',
        },
        error: {
            main: '#CF4747',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#FDFBF7', // Soft cream background
            paper: '#ffffff',
        },
        text: {
            primary: '#343434',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: {
            fontWeight: 300,
        },
        h2: {
            fontWeight: 400,
        },
        h3: {
            fontWeight: 500,
        },
        h4: {
            fontWeight: 500,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 400,
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    transition: 'all 0.3s ease',
                },
                containedPrimary: {
                    boxShadow: '0 4px 10px rgba(138, 111, 62, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 15px rgba(138, 111, 62, 0.35)',
                    },
                },
                containedSecondary: {
                    boxShadow: '0 4px 10px rgba(93, 67, 86, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 15px rgba(93, 67, 86, 0.35)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                },
            },
        },
    },
});

// Protected Route component
const ProtectedRoute: React.FC<{ 
    children: React.ReactNode;
    requiredRole?: string;
}> = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ flexGrow: 1 }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/basket" element={<BasketPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/payment/vietqr/:orderId" element={<VietQRPaymentPage />} />
                        <Route path="/payment/momo/:orderId" element={<MoMoPaymentPage />} />
                        <Route path="/orders/success" element={<OrderSuccessPage />} />
                        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        
                        {/* Admin Routes */}
                        <Route 
                            path="/admin/categories" 
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <CategoriesPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/products" 
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminProductsPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/admin/orders" 
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminOrdersPage />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default App; 