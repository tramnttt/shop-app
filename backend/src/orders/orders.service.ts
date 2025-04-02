import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Customer } from '../entities/customer.entity';
import { CreateOrderDto, PaymentMethod, PaymentStatus } from './dto/create-order.dto';

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
            order.total_amount = createOrderDto.total;
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
                    order_id: savedOrder.order_id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                });

                orderItems.push(await queryRunner.manager.save(orderItem));
            }

            // Commit transaction
            await queryRunner.commitTransaction();

            // Transform the response to match frontend expectations
            return {
                id: savedOrder.order_id,
                userId: customerId,
                orderNumber: `ORD-${savedOrder.order_id}-${Date.now().toString().slice(-6)}`,
                status: savedOrder.status,
                items: createOrderDto.items,
                total: createOrderDto.total,
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
            relations: ['orderItems', 'orderItems.product'],
            order: { created_at: 'DESC' },
        });

        return orders.map(order => this.transformOrderToDto(order));
    }

    async getOrderById(orderId: number, customerId: number) {
        const order = await this.ordersRepository.findOne({
            where: { order_id: orderId, customer_id: customerId },
            relations: ['orderItems', 'orderItems.product'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        return this.transformOrderToDto(order);
    }

    async cancelOrder(orderId: number, customerId: number) {
        const order = await this.ordersRepository.findOne({
            where: { order_id: orderId, customer_id: customerId },
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
        // Transform order items
        const items = order.orderItems.map(item => {
            // Find the main image URL if available
            const imageUrl = item.product?.images && item.product.images.length > 0
                ? item.product.images[0]?.image_url
                : null;

            return {
                id: item.product_id,
                name: item.product?.name || 'Unknown Product',
                price: parseFloat(item.unit_price.toString()),
                quantity: item.quantity,
                image_url: imageUrl,
            };
        });

        // Determine payment method from order data (this is a placeholder)
        // In real implementation, you would store this in the database
        const paymentMethod = PaymentMethod.COD; // Default to COD for now

        return {
            id: order.order_id,
            userId: order.customer_id,
            orderNumber: `ORD-${order.order_id}`,
            status: order.status,
            items,
            total: parseFloat(order.total_amount.toString()),
            orderDetails: {
                // This is a placeholder - in a real implementation, you would
                // either store order details in a separate table or serialize them
                fullName: 'Retrieved from database',
                email: 'Retrieved from database',
                phone: 'Retrieved from database',
                address: 'Retrieved from database',
                city: 'Retrieved from database',
                postalCode: 'Retrieved from database',
            },
            paymentMethod,
            paymentStatus: PaymentStatus.PENDING, // Placeholder
            createdAt: order.created_at.toISOString(),
            updatedAt: order.updated_at.toISOString(),
        };
    }
} 