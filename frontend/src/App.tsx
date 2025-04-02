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
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
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
                    </Routes>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default App; 