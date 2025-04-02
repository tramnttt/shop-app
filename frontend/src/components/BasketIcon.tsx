import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useBasket } from '../hooks/useBasket';
import { useNavigate } from 'react-router-dom';

const BasketIcon: React.FC = () => {
  const { basket } = useBasket();
  const navigate = useNavigate();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Calculate total number of items
    const count = basket.items.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  }, [basket]);

  return (
    <Tooltip title="View Basket">
      <IconButton 
        color="inherit" 
        onClick={() => navigate('/basket')}
        aria-label="basket"
      >
        <Badge badgeContent={itemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default BasketIcon; 