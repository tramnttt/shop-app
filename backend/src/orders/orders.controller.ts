import { Controller, Post, Body, Get, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

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