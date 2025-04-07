import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';
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

// MoMo Payment Types
enum MoMoPayType {
    QR_CODE = 3, // For POS QR payments
}

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        private configService: ConfigService,
    ) { }

    async generateVietQR(orderId: number, amount: number): Promise<QRCodeData> {
        // Find the order to verify it exists
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Create a payment record linked to this order
        await this.createPaymentRecord(orderId, amount, 'vietqr');

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
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems']
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Calculate amount from order total
        const amount = Math.round(parseFloat(order.total_amount.toString()));

        // Create a payment record linked to this order
        const paymentRecord = await this.createPaymentRecord(orderId, amount, 'momo');

        try {
            // Get MoMo configuration from environment variables
            const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
            const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
            const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
            const posEndpoint = this.configService.get<string>('MOMO_POS_ENDPOINT');

            if (!partnerCode || !accessKey || !secretKey || !posEndpoint) {
                this.logger.warn('MoMo API configuration missing, falling back to mock QR code');
                return this.generateMockMoMoQR(orderId, order);
            }

            // Create a partnerRefId (order reference)
            const partnerRefId = `ORDER-${orderId}-${Date.now()}`;

            // Generate a unique payment code in the format MoMo expects (simulating what would be scanned at POS)
            // In a real app, this would come from the MoMo app QR code
            const paymentCode = `MM${Date.now()}${Math.floor(Math.random() * 1000000)}`;

            // Prepare JSON string according to MoMo documentation
            const jsonString = JSON.stringify({
                partnerCode: partnerCode,
                partnerRefId: partnerRefId,
                amount: amount,
                paymentCode: paymentCode,
                storeId: 'JEWELRY-SHOP-01',
                storeName: 'Jewelry Shop Online Store'
            });

            // RSA encrypt the jsonString using the public key (in real scenario)
            // For testing, we'll just encode it to base64
            const hash = Buffer.from(jsonString).toString('base64');

            // Prepare request payload as per MoMo docs
            const requestData = {
                partnerCode: partnerCode,
                partnerRefId: partnerRefId,
                hash: hash,
                version: 2.0,
                payType: MoMoPayType.QR_CODE,
                description: `Payment for order #${orderId}`,
                extra_data: JSON.stringify({
                    sku: order.orderItems.map(item => item.product_id).join(',')
                })
            };

            // Update the payment record with the partnerRefId
            await this.updatePaymentTransactionId(orderId, partnerRefId);

            // In a production system, we would make an actual API call to MoMo here
            /*
            const response = await axios.post(posEndpoint, requestData);
            if (response.data && response.data.status === 0) {
                // Process successful response
                // The actual response would include QR data
            }
            */

            // For demonstration, we'll generate a mock QR response
            this.logger.log(`MoMo payment request prepared for order ${orderId}`);

            // Generate QR code data with payment URL
            // In a real implementation, this would come from MoMo API
            const qrCodeData: QRCodeData = {
                orderId,
                qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
                amount: amount,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
                paymentUrl: `https://test-payment.momo.vn/pay/app?partnerCode=${partnerCode}&orderId=${partnerRefId}`,
                // Include partnerRefId for later reference
                partnerRefId: partnerRefId
            };

            return qrCodeData;

        } catch (error) {
            this.logger.error('Error generating MoMo QR code', error);
            return this.generateMockMoMoQR(orderId, order);
        }
    }

    // Helper method to generate mock QR code
    private generateMockMoMoQR(orderId: number, order: Order): QRCodeData {
        // Generate a mock transaction ID
        const mockTransactionId = `MOCK-ORDER-${orderId}-${Date.now()}`;

        // Update the payment record with the mock transaction ID
        this.updatePaymentTransactionId(orderId, mockTransactionId).catch(err => {
            this.logger.error('Failed to update payment with mock transaction ID', err);
        });

        return {
            orderId,
            qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`,
            amount: parseFloat(order.total_amount.toString()),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
            partnerRefId: mockTransactionId
        };
    }

    async confirmMoMoPayment(partnerRefId: string, requestType: 'capture' | 'revertAuthorize'): Promise<boolean> {
        try {
            // Get payment record by partnerRefId
            const payment = await this.paymentsRepository.findOne({
                where: { transaction_id: partnerRefId },
                relations: ['order']
            });

            if (!payment) {
                this.logger.error(`No payment found with partnerRefId: ${partnerRefId}`);
                return false;
            }

            // Get MoMo configuration
            const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
            const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
            const confirmEndpoint = this.configService.get<string>('MOMO_CONFIRM_ENDPOINT');

            if (!partnerCode || !secretKey || !confirmEndpoint) {
                this.logger.error('MoMo API configuration missing');
                return false;
            }

            // Generate requestId
            const requestId = `${Date.now()}`;

            // Get momoTransId (in real scenario this would come from the previous API response)
            const momoTransId = payment.transaction_id || `MOCK-${Date.now()}`;

            // Generate signature
            const rawSignature = `partnerCode=${partnerCode}&partnerRefId=${partnerRefId}&requestType=${requestType}&requestId=${requestId}&momoTransId=${momoTransId}`;
            const signature = crypto
                .createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            // Prepare request body
            const requestBody = {
                partnerCode: partnerCode,
                partnerRefId: partnerRefId,
                requestType: requestType,
                requestId: requestId,
                momoTransId: momoTransId,
                signature: signature,
                customerNumber: '' // Optional in this case
            };

            // In a production system, make actual API call
            /*
            const response = await axios.post(confirmEndpoint, requestBody);
            if (response.data && response.data.status === 0) {
                // Process successful response
                this.logger.log(`MoMo payment ${requestType} confirmed for partner ref: ${partnerRefId}`);
                
                if (requestType === 'capture') {
                    // Update payment status
                    payment.status = PaymentStatus.PAID;
                    payment.payment_date = new Date();
                    await this.paymentsRepository.save(payment);
                    
                    // Update order status
                    if (payment.order) {
                        payment.order.status = 'PAID';
                        await this.ordersRepository.save(payment.order);
                    }
                } else if (requestType === 'revertAuthorize') {
                    // Payment cancelled/refunded
                    payment.status = PaymentStatus.FAILED;
                    await this.paymentsRepository.save(payment);
                }
                
                return true;
            } else {
                this.logger.error(`MoMo confirm failed: ${response.data?.message}`);
                return false;
            }
            */

            // For demo, simulate success
            this.logger.log(`[DEMO] MoMo payment ${requestType} confirmed for partner ref: ${partnerRefId}`);

            if (requestType === 'capture') {
                // Update payment status
                payment.status = PaymentStatus.PAID;
                payment.payment_date = new Date();
                await this.paymentsRepository.save(payment);

                // Update order status
                if (payment.order) {
                    payment.order.status = 'PAID';
                    await this.ordersRepository.save(payment.order);
                }
            } else if (requestType === 'revertAuthorize') {
                // Payment cancelled/refunded
                payment.status = PaymentStatus.FAILED;
                await this.paymentsRepository.save(payment);
            }

            return true;

        } catch (error) {
            this.logger.error('Error confirming MoMo payment', error);
            return false;
        }
    }

    async checkPaymentStatus(orderId: number): Promise<{ status: PaymentStatus }> {
        // Find the order to verify it exists
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['payments']
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Find the most recent payment for this order
        const latestPayment = order.payments && order.payments.length > 0
            ? order.payments.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            : null;

        if (!latestPayment) {
            this.logger.warn(`No payment record found for order ${orderId}`);
            return { status: PaymentStatus.PENDING };
        }

        // If payment method is MoMo and status is still pending, attempt to confirm payment
        if (latestPayment.payment_method === 'momo' &&
            latestPayment.status === PaymentStatus.PENDING &&
            latestPayment.transaction_id) {
            // Try to confirm the payment
            const confirmed = await this.confirmMoMoPayment(latestPayment.transaction_id, 'capture');

            if (confirmed) {
                return { status: PaymentStatus.PAID };
            }
        }

        return { status: latestPayment.status as PaymentStatus };
    }

    async handleMoMoCallback(callbackData: any): Promise<void> {
        this.logger.log('Received MoMo callback', callbackData);

        // Verify the callback using MoMo signature
        // In a real implementation, you would validate the signature here

        try {
            // Get the partnerRefId from the callback data
            const partnerRefId = callbackData.partnerRefId;

            // Find the payment by transaction_id (which should be partnerRefId)
            const payment = await this.paymentsRepository.findOne({
                where: { transaction_id: partnerRefId },
                relations: ['order']
            });

            if (!payment) {
                this.logger.error(`No payment found with partnerRefId: ${partnerRefId}`);
                return;
            }

            // Check if the payment was successful
            if (callbackData.resultCode === 0) {
                // Update payment status
                payment.status = PaymentStatus.PAID;
                payment.payment_date = new Date();
                await this.paymentsRepository.save(payment);

                // Update order status
                if (payment.order) {
                    payment.order.status = 'PAID';
                    await this.ordersRepository.save(payment.order);
                }

                this.logger.log(`Payment for partnerRefId ${partnerRefId} completed successfully`);
            } else {
                // Mark payment as failed
                payment.status = PaymentStatus.FAILED;
                await this.paymentsRepository.save(payment);

                this.logger.warn(`Payment failed for partnerRefId ${partnerRefId}: ${callbackData.message}`);
            }
        } catch (error) {
            this.logger.error('Error processing MoMo callback', error);
        }
    }

    // Helper method to create a payment record
    private async createPaymentRecord(
        orderId: number,
        amount: number,
        paymentMethod: string
    ): Promise<Payment> {
        // Check if a pending payment of this type already exists
        const existingPayment = await this.paymentsRepository.findOne({
            where: {
                order_id: orderId,
                payment_method: paymentMethod,
                status: PaymentStatus.PENDING
            }
        });

        if (existingPayment) {
            this.logger.log(`Using existing pending ${paymentMethod} payment for order ${orderId}`);
            return existingPayment;
        }

        // Create a new payment record
        const payment = this.paymentsRepository.create({
            order_id: orderId,
            payment_method: paymentMethod,
            amount,
            status: PaymentStatus.PENDING
        });

        const savedPayment = await this.paymentsRepository.save(payment);
        this.logger.log(`Created new ${paymentMethod} payment record for order ${orderId}`);

        return savedPayment;
    }

    // Helper method to update payment transaction ID
    private async updatePaymentTransactionId(
        orderId: number,
        transactionId: string
    ): Promise<void> {
        const payment = await this.paymentsRepository.findOne({
            where: {
                order_id: orderId,
                status: PaymentStatus.PENDING
            },
            order: { created_at: 'DESC' }
        });

        if (payment) {
            payment.transaction_id = transactionId;
            await this.paymentsRepository.save(payment);
            this.logger.log(`Updated payment for order ${orderId} with transaction ID ${transactionId}`);
        }
    }
} 