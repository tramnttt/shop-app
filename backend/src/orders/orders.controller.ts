import { Controller, Post, Body, Get, Param, UseGuards, Request, HttpException, HttpStatus, Query, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto, GetOrdersFilterDto, UpdateOrderStatusDto, UpdatePaymentStatusDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // Admin endpoints
    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all orders (admin only)' })
    @ApiResponse({ status: 200, description: 'Returns paginated orders list' })
    async getAllOrders(@Query() filterDto: GetOrdersFilterDto) {
        return this.ordersService.getAllOrders(filterDto);
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get order by ID (admin only)' })
    @ApiResponse({ status: 200, description: 'Returns order details' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderByIdAdmin(@Param('id') id: string) {
        const orderId = parseInt(id, 10);
        return this.ordersService.getOrderByIdAdmin(orderId);
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update order status (admin only)' })
    @ApiResponse({ status: 200, description: 'Order status updated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto
    ) {
        const orderId = parseInt(id, 10);
        return this.ordersService.updateOrderStatus(orderId, updateStatusDto);
    }

    @Patch('admin/:id/payment')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update payment status (admin only)' })
    @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updatePaymentStatus(
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentStatusDto
    ) {
        const orderId = parseInt(id, 10);
        return this.ordersService.updatePaymentStatus(orderId, updatePaymentDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        try {
            const customerId = req.user.id;
            console.log("customerId from create order: ", customerId);
            return await this.ordersService.createOrder(customerId, createOrderDto);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user orders' })
    @ApiResponse({ status: 200, description: 'Returns user orders' })
    async getUserOrders(@Request() req) {
        const customerId = req.user.id;
        return this.ordersService.getUserOrders(customerId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiResponse({ status: 200, description: 'Returns order details' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderById(@Param('id') id: string, @Request() req) {
        const orderId = parseInt(id, 10);
        const customerId = req.user.id;
        const order = await this.ordersService.getOrderById(orderId, customerId);

        if (!order) {
            throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        return order;
    }

    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel an order' })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancelOrder(@Param('id') id: string, @Request() req) {
        const orderId = parseInt(id, 10);
        const customerId = req.user.id;
        return this.ordersService.cancelOrder(orderId, customerId);
    }
} 