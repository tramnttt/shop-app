import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Header } from './components/Header';
import { Routes, Route } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CategoryManagement from './pages/admin/CategoryManagement';
import { useAuth } from './contexts/AuthContext';

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

const App: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        {isAdmin && (
                            <Route path="/admin/categories" element={<CategoryManagement />} />
                        )}
                    </Routes>
                </Container>
                <Footer />
            </Box>
        </ThemeProvider>
    );
};

export default App; 