import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, Between, Like } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Customer } from '../entities/customer.entity';
import {
    CreateOrderDto,
    PaymentMethod,
    PaymentStatus,
    UpdateOrderStatusDto,
    UpdatePaymentStatusDto,
    GetOrdersFilterDto,
    OrderStatus
} from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private connection: Connection,
    ) { }

    // Admin methods
    async getAllOrders(filters: GetOrdersFilterDto) {
        const skip = (filters.page - 1) * filters.limit;

        // Build the query
        const queryBuilder = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.orderItems', 'orderItems')
            .leftJoinAndSelect('orderItems.product', 'product')
            .leftJoinAndSelect('order.payments', 'payments');

        // Apply filters
        if (filters.status) {
            queryBuilder.andWhere('order.status = :status', { status: filters.status });
        }

        if (filters.paymentStatus) {
            // Filter by payment status in the payments table
            queryBuilder.andWhere('EXISTS (SELECT 1 FROM payment WHERE payment.order_id = order.id AND payment.status = :paymentStatus)',
                { paymentStatus: filters.paymentStatus });
        }

        if (filters.customerId) {
            queryBuilder.andWhere('order.customer_id = :customerId', { customerId: filters.customerId });
        }

        if (filters.dateFrom) {
            queryBuilder.andWhere('order.created_at >= :dateFrom', { dateFrom: filters.dateFrom });
        }

        if (filters.dateTo) {
            queryBuilder.andWhere('order.created_at <= :dateTo', { dateTo: filters.dateTo });
        }

        // Apply sorting
        if (filters.sortField === 'createdAt') {
            queryBuilder.orderBy('order.created_at', filters.sortOrder);
        } else if (filters.sortField === 'updatedAt') {
            queryBuilder.orderBy('order.updated_at', filters.sortOrder);
        } else if (filters.sortField === 'total') {
            queryBuilder.orderBy('order.total_amount', filters.sortOrder);
        }

        // Count total items for pagination
        const total = await queryBuilder.getCount();

        // Get paginated results
        const orders = await queryBuilder
            .skip(skip)
            .take(filters.limit)
            .getMany();

        const transformedOrders = orders.map(order => this.transformOrderToDto(order));

        // Return the paginated result with metadata
        return {
            items: transformedOrders,
            meta: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit)
            }
        };
    }

    async updateOrderStatus(orderId: number, updateStatusDto: UpdateOrderStatusDto) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'orderItems.product']
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Update status
        order.status = updateStatusDto.status;
        await this.ordersRepository.save(order);

        return this.transformOrderToDto(order);
    }

    async updatePaymentStatus(orderId: number, updatePaymentDto: UpdatePaymentStatusDto) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'orderItems.product']
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Update payment status (assuming we store it in the order entity)
        // Note: In a real application, you might need to modify your Order entity to include this field
        if (order['paymentStatus'] !== undefined) {
            order['paymentStatus'] = updatePaymentDto.paymentStatus;
        }

        await this.ordersRepository.save(order);

        return this.transformOrderToDto(order);
    }

    // Get order by ID (admin version - doesn't filter by customer)
    async getOrderByIdAdmin(orderId: number) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'orderItems.product', 'payments'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return this.transformOrderToDto(order);
    }

    async createOrder(customerId: number, createOrderDto: CreateOrderDto) {
        // Validate customer exists
        const customer = await this.customersRepository.findOne({ where: { customer_id: customerId } });
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }

        // Start a transaction
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create the order
            const order = new Order();
            order.customer_id = customerId;

            console.log('total from createOrderDto:', createOrderDto.total);
            // Ensure total_amount is properly set as a number
            if (typeof createOrderDto.total !== 'number' || isNaN(createOrderDto.total)) {
                throw new BadRequestException('Total must be a valid number');
            }

            // Calculate total ourselves from items instead of relying on the provided total
            const calculatedTotal = createOrderDto.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            console.log('Calculated total from items:', calculatedTotal);

            // Set both total and total_amount fields
            order.total_amount = calculatedTotal;
            order.total = calculatedTotal;
            order.status = 'PENDING';

            const savedOrder = await queryRunner.manager.save(order);

            // Create order items
            const orderItems = [];

            for (const item of createOrderDto.items) {
                // Check if product exists
                const product = await this.productsRepository.findOne({ where: { product_id: item.id } });
                if (!product) {
                    throw new BadRequestException(`Product with ID ${item.id} not found`);
                }

                const orderItem = queryRunner.manager.create(OrderItem, {
                    order_id: savedOrder.id, // Use the id field instead of order_id
                    product_id: item.id,
                    name: item.name || product.name || 'Unknown Product', // Set the name field
                    quantity: item.quantity,
                    price: item.price, // Set the price field
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                });

                orderItems.push(await queryRunner.manager.save(orderItem));
            }

            // Commit transaction
            await queryRunner.commitTransaction();

            // Transform the response to match frontend expectations
            return {
                id: savedOrder.id, // Use the id field
                userId: customerId,
                orderNumber: `ORD-${savedOrder.id}-${Date.now().toString().slice(-6)}`,
                status: savedOrder.status,
                items: createOrderDto.items,
                total: calculatedTotal, // Return the calculated total for consistency
                orderDetails: createOrderDto.orderDetails,
                paymentMethod: createOrderDto.paymentMethod,
                paymentStatus: PaymentStatus.PENDING,
                createdAt: savedOrder.created_at.toISOString(),
                updatedAt: savedOrder.updated_at.toISOString(),
            };
        } catch (error) {
            // Rollback transaction in case of error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release the query runner
            await queryRunner.release();
        }
    }

    async getUserOrders(customerId: number) {
        const orders = await this.ordersRepository.find({
            where: { customer_id: customerId },
            relations: ['orderItems', 'orderItems.product', 'payments'],
            order: { created_at: 'DESC' },
        });

        return orders.map(order => this.transformOrderToDto(order));
    }

    async getOrderById(orderId: number, customerId: number) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId, customer_id: customerId }, // Use the id field
            relations: ['orderItems', 'orderItems.product', 'payments'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return this.transformOrderToDto(order);
    }

    async cancelOrder(orderId: number, customerId: number) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId, customer_id: customerId }, // Use the id field
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        if (order.status !== 'PENDING') {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        order.status = 'CANCELLED';
        await this.ordersRepository.save(order);

        return this.getOrderById(orderId, customerId);
    }

    private transformOrderToDto(order: Order) {
        const orderItems = order.orderItems || [];
        let paymentStatus = PaymentStatus.PENDING;
        let paymentMethod = '';

        // Get payment information if available
        if (order.payments && order.payments.length > 0) {
            // Find the most recent payment
            const latestPayment = order.payments.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            paymentStatus = latestPayment.status as PaymentStatus;
            paymentMethod = latestPayment.payment_method;
        }

        return {
            id: order.id,
            userId: order.customer_id,
            orderNumber: `ORD-${order.id}-${new Date(order.created_at).getTime().toString().slice(-6)}`,
            status: order.status,
            items: orderItems.map(item => ({
                id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(String(item.price || item.unit_price)),
                name: item.name,
                image: item.product?.images?.[0]?.image_url || null,
            })),
            total: parseFloat(String(order.total_amount)),
            paymentMethod,
            paymentStatus,
            createdAt: order.created_at.toISOString(),
            updatedAt: order.updated_at.toISOString(),
        };
    }
} 