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
            relations: ['orderItems', 'orderItems.product'],
            order: { created_at: 'DESC' },
        });

        return orders.map(order => this.transformOrderToDto(order));
    }

    async getOrderById(orderId: number, customerId: number) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId, customer_id: customerId }, // Use the id field
            relations: ['orderItems', 'orderItems.product'],
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
        // Transform order items
        const items = order.orderItems.map(item => {
            // Find the main image URL if available
            const imageUrl = item.product?.images && item.product.images.length > 0
                ? item.product.images[0]?.image_url
                : null;

            return {
                id: item.product_id,
                name: item.name || (item.product?.name || 'Unknown Product'), // Use item.name directly if available
                price: item.price ? parseFloat(item.price.toString()) : parseFloat(item.unit_price.toString()), // Use price field if available
                quantity: item.quantity,
                image_url: imageUrl,
            };
        });

        // Determine payment method from order data (this is a placeholder)
        // In real implementation, you would store this in the database
        const paymentMethod = PaymentMethod.COD; // Default to COD for now

        return {
            id: order.id, // Use the id field
            userId: order.customer_id,
            orderNumber: `ORD-${order.id}`, // Use the id field
            status: order.status,
            items,
            // Use the total field directly if available, otherwise fall back to total_amount
            total: order.total ? parseFloat(order.total.toString()) : parseFloat(order.total_amount.toString()),
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