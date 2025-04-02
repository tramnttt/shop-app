import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { QRCodeData } from '../orders/dto/create-order.dto';

// Define PaymentStatus enum from the DTO
export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) { }

    async generateVietQR(orderId: number, amount: number): Promise<QRCodeData> {
        // Find the order to verify it exists
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // In a real implementation, you would call the VietQR API here
        // For this demo, we'll generate a fake QR code

        // Create a mock QR code data
        const mockQrCodeData: QRCodeData = {
            orderId,
            qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
            amount,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Expires in 30 minutes
        };

        return mockQrCodeData;
    }

    async generateMoMoQR(orderId: number): Promise<QRCodeData> {
        // Find the order to verify it exists and get the amount
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // In a real implementation, you would call the MoMo API here
        // For this demo, we'll generate a fake QR code

        // Create a mock QR code data
        const mockQrCodeData: QRCodeData = {
            orderId,
            qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
            amount: parseFloat(order.total_amount.toString()),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
        };

        return mockQrCodeData;
    }

    async checkPaymentStatus(orderId: number): Promise<{ status: PaymentStatus }> {
        // Find the order to verify it exists
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // In a real implementation, you would call the payment provider's API to check status
        // For this demo, we'll simulate a random payment status

        // Random success rate (70% of the time it's paid)
        const isPaid = Math.random() < 0.7;

        // If paid, update the order status
        if (isPaid) {
            order.status = 'PAID';
            await this.ordersRepository.save(order);
        }

        return {
            status: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        };
    }
} 