import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { QRCodeData } from '../orders/dto/create-order.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

// Define PaymentStatus enum from the DTO
export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private configService: ConfigService,
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

        try {
            // Get MoMo configuration from environment variables
            const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
            const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
            const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
            const apiEndpoint = this.configService.get<string>('MOMO_API_ENDPOINT');
            const returnUrl = this.configService.get<string>('MOMO_RETURN_URL');
            const notifyUrl = this.configService.get<string>('MOMO_NOTIFY_URL');

            if (!partnerCode || !accessKey || !secretKey || !apiEndpoint) {
                this.logger.warn('MoMo API configuration missing, falling back to mock QR code');
                return this.generateMockMoMoQR(orderId, order);
            }

            // Create a unique request ID
            const requestId = `${Date.now()}_${orderId}`;
            const orderInfo = `Payment for order #${orderId}`;
            const amount = Math.round(parseFloat(order.total_amount.toString()));
            const extraData = Buffer.from(JSON.stringify({ orderId })).toString('base64');
            const requestType = 'captureWallet';

            // Prepare the raw signature
            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;

            // Create signature using HMAC SHA256
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            // Prepare the request body
            const requestBody = {
                partnerCode,
                accessKey,
                requestId,
                amount,
                orderId: requestId,
                orderInfo,
                redirectUrl: returnUrl,
                ipnUrl: notifyUrl,
                extraData,
                requestType,
                signature,
                lang: 'en',
            };

            // Call MoMo API
            const response = await axios.post(apiEndpoint, requestBody);

            if (response.data && response.data.payUrl) {
                // Generate QR code from the payment URL
                // In a real implementation, you'd use a QR code generation library
                // For simplicity, we'll use the payment URL directly and mock a QR code

                return {
                    orderId,
                    qrCode: response.data.payUrl, // In a real implementation, convert this URL to a QR code image
                    amount: amount,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
                    paymentUrl: response.data.payUrl, // Add direct payment URL for mobile/web redirect
                };
            } else {
                this.logger.error('Failed to get MoMo payment URL', response.data);
                return this.generateMockMoMoQR(orderId, order);
            }
        } catch (error) {
            this.logger.error('Error generating MoMo QR code', error);
            // Fall back to mock QR code on failure
            return this.generateMockMoMoQR(orderId, order);
        }
    }

    // Helper method to generate mock QR code
    private generateMockMoMoQR(orderId: number, order: Order): QRCodeData {
        return {
            orderId,
            qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
            amount: parseFloat(order.total_amount.toString()),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
        };
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

    async handleMoMoCallback(callbackData: any): Promise<void> {
        this.logger.log('Received MoMo callback', callbackData);

        // Verify the callback using MoMo signature
        // In a real implementation, you would validate the signature here

        try {
            // Extract the orderId from extraData
            const extraData = callbackData.extraData;
            const decodedData = JSON.parse(Buffer.from(extraData, 'base64').toString());
            const orderId = decodedData.orderId;

            // Find the order
            const order = await this.ordersRepository.findOne({ where: { id: orderId } });
            if (!order) {
                this.logger.error(`Order with ID ${orderId} not found in callback`);
                return;
            }

            // Check if the payment was successful
            if (callbackData.resultCode === 0) {
                // Update order status to PAID
                order.status = 'PAID';
                await this.ordersRepository.save(order);
                this.logger.log(`Order ${orderId} payment completed successfully`);
            } else {
                this.logger.warn(`Payment failed for order ${orderId}: ${callbackData.message}`);
            }
        } catch (error) {
            this.logger.error('Error processing MoMo callback', error);
        }
    }
} 