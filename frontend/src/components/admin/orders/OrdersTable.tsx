import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, MenuItem, Box, TablePagination, Tooltip, CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Visibility as ViewIcon, 
  FilterList as FilterIcon, 
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAdminOrders, OrderStatus, PaymentStatus, OrderType } from '../../../hooks/useAdminOrders';
import { formatCurrency } from '../../../utils/format';

// Order Status Colors
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'PROCESSING': return 'info';
    case 'SHIPPED': return 'primary';
    case 'DELIVERED': return 'success';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
};

// Payment Status Colors
const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'PAID': return 'success';
    case 'FAILED': return 'error';
    default: return 'default';
  }
};

// Format date strings
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const OrdersTable: React.FC = () => {
  const { 
    orders, 
    metadata, 
    isLoading, 
    error, 
    filters, 
    handlePageChange, 
    handleLimitChange, 
    handleFilterChange, 
    clearFilters,
    updateOrderStatus,
    updatePaymentStatus
  } = useAdminOrders();

  // State for filter dialog
  const [showFilters, setShowFilters] = useState(false);
  
  // State for edit order dialog
  const [editOrderDialog, setEditOrderDialog] = useState<{
    open: boolean;
    order: OrderType | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
  }>({
    open: false,
    order: null,
    status: 'PENDING',
    paymentStatus: 'PENDING'
  });

  // State for view order details dialog
  const [viewOrderDialog, setViewOrderDialog] = useState<{
    open: boolean;
    order: OrderType | null;
  }>({
    open: false,
    order: null
  });

  // Handle opening edit dialog
  const handleEditClick = (order: OrderType) => {
    setEditOrderDialog({
      open: true,
      order,
      status: order.status,
      paymentStatus: order.paymentStatus
    });
  };

  // Handle closing edit dialog
  const handleEditClose = () => {
    setEditOrderDialog({
      ...editOrderDialog,
      open: false
    });
  };

  // Handle saving order updates
  const handleSaveEdit = () => {
    if (!editOrderDialog.order) return;

    // If status changed, update it
    if (editOrderDialog.status !== editOrderDialog.order.status) {
      updateOrderStatus.mutate({
        orderId: editOrderDialog.order.id,
        status: editOrderDialog.status
      });
    }

    // If payment status changed, update it
    if (editOrderDialog.paymentStatus !== editOrderDialog.order.paymentStatus) {
      updatePaymentStatus.mutate({
        orderId: editOrderDialog.order.id,
        paymentStatus: editOrderDialog.paymentStatus
      });
    }

    handleEditClose();
  };

  // Handle opening view dialog
  const handleViewClick = (order: OrderType) => {
    setViewOrderDialog({
      open: true,
      order
    });
  };

  // Handle closing view dialog
  const handleViewClose = () => {
    setViewOrderDialog({
      ...viewOrderDialog,
      open: false
    });
  };

  if (isLoading) {
    return <Box display="flex" justifyContent="center" padding={4}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">Error loading orders: {error.toString()}</Typography>;
  }

  return (
    <>
      {/* Filters Button and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">Order Management</Typography>
        <Box>
          <Button 
            startIcon={<FilterIcon />} 
            variant="outlined" 
            onClick={() => setShowFilters(true)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          {(filters.status || filters.paymentStatus || filters.customerId || filters.dateFrom || filters.dateTo) && (
            <Button 
              startIcon={<CloseIcon />} 
              color="secondary" 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No orders found</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{order.orderDetails.fullName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {order.paymentMethod}
                      </Typography>
                      <Chip 
                        label={order.paymentStatus} 
                        color={getPaymentStatusColor(order.paymentStatus) as any}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewClick(order)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Order">
                      <IconButton size="small" onClick={() => handleEditClick(order)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {metadata && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {metadata.page === 1 ? 1 : (metadata.page - 1) * metadata.limit + 1} to{' '}
              {Math.min(metadata.page * metadata.limit, metadata.total)} of {metadata.total} orders
            </Typography>
            
            <TablePagination
              component="div"
              count={metadata.total}
              page={metadata.page - 1}  // MUI uses 0-based indexing
              rowsPerPage={metadata.limit}
              onPageChange={(_, page) => handlePageChange(page + 1)}
              onRowsPerPageChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Orders per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              SelectProps={{
                inputProps: { 'aria-label': 'Orders per page' },
                native: true,
              }}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-select, & .MuiTablePagination-selectIcon': {
                  display: { xs: 'none', sm: 'block' }
                }
              }}
            />
          </Box>
        )}
      </TableContainer>

      {/* Filter Dialog */}
      <Dialog open={showFilters} onClose={() => setShowFilters(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Filter Orders
          <IconButton 
            aria-label="close" 
            onClick={() => setShowFilters(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Order Status"
              fullWidth
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value as OrderStatus || undefined })}
              variant="outlined"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>

            <TextField
              select
              label="Payment Status"
              fullWidth
              value={filters.paymentStatus || ''}
              onChange={(e) => handleFilterChange({ paymentStatus: e.target.value as PaymentStatus || undefined })}
              variant="outlined"
            >
              <MenuItem value="">All Payment Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </TextField>

            <TextField
              label="Customer ID"
              fullWidth
              type="number"
              value={filters.customerId || ''}
              onChange={(e) => handleFilterChange({ 
                customerId: e.target.value ? parseInt(e.target.value, 10) : undefined 
              })}
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange({ 
                  dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                })}
                variant="outlined"
              />
              
              <TextField
                label="To Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange({ 
                  dateTo: e.target.value ? new Date(e.target.value) : undefined 
                })}
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters} color="secondary">
            Clear Filters
          </Button>
          <Button onClick={() => setShowFilters(false)} color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editOrderDialog.open} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Order {editOrderDialog.order?.orderNumber}
          <IconButton 
            aria-label="close" 
            onClick={handleEditClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Order Status"
              fullWidth
              value={editOrderDialog.status}
              onChange={(e) => setEditOrderDialog({
                ...editOrderDialog,
                status: e.target.value as OrderStatus
              })}
              variant="outlined"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="SHIPPED">Shipped</MenuItem>
              <MenuItem value="DELIVERED">Delivered</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>

            <TextField
              select
              label="Payment Status"
              fullWidth
              value={editOrderDialog.paymentStatus}
              onChange={(e) => setEditOrderDialog({
                ...editOrderDialog,
                paymentStatus: e.target.value as PaymentStatus
              })}
              variant="outlined"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            color="primary"
            disabled={updateOrderStatus.isLoading || updatePaymentStatus.isLoading}
          >
            {(updateOrderStatus.isLoading || updatePaymentStatus.isLoading) ? 
              <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={viewOrderDialog.open} onClose={handleViewClose} fullWidth maxWidth="md">
        <DialogTitle>
          Order Details: {viewOrderDialog.order?.orderNumber}
          <IconButton 
            aria-label="close" 
            onClick={handleViewClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewOrderDialog.order && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Order Summary */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography>{formatDate(viewOrderDialog.order.createdAt)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={viewOrderDialog.order.status} 
                      color={getStatusColor(viewOrderDialog.order.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                    <Typography>{viewOrderDialog.order.paymentMethod}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                    <Chip 
                      label={viewOrderDialog.order.paymentStatus} 
                      color={getPaymentStatusColor(viewOrderDialog.order.paymentStatus) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h6">{formatCurrency(viewOrderDialog.order.total)}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Customer Information */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography>{viewOrderDialog.order.orderDetails.fullName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography>{viewOrderDialog.order.orderDetails.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography>{viewOrderDialog.order.orderDetails.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography>
                      {viewOrderDialog.order.orderDetails.address}, {viewOrderDialog.order.orderDetails.city}, {viewOrderDialog.order.orderDetails.postalCode}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Order Items */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewOrderDialog.order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name} 
                                  style={{ width: 40, height: 40, objectFit: 'cover' }}
                                />
                              )}
                              <Typography>{item.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(viewOrderDialog.order.total)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              handleViewClose();
              handleEditClick(viewOrderDialog.order!);
            }} 
            color="primary"
            disabled={!viewOrderDialog.order}
          >
            Edit Order
          </Button>
          <Button onClick={handleViewClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrdersTable; 