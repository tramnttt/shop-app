import React from 'react';
import { Container, Typography } from '@mui/material';
import Basket from '../components/Basket';

const BasketPage: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Shopping Basket
            </Typography>
            <Basket />
        </Container>
    );
};

export default BasketPage; 