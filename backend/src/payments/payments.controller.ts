import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, Req, HttpStatus, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('generate-vietqr/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate VietQR code for an order' })
    @ApiResponse({ status: 200, description: 'QR code generated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async generateVietQR(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body('amount') amount: number,
    ) {
        return this.paymentsService.generateVietQR(orderId, amount);
    }

    @Post('generate-momo/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate MoMo QR code for an order' })
    @ApiResponse({ status: 200, description: 'QR code generated successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async generateMoMoQR(
        @Param('orderId', ParseIntPipe) orderId: number,
    ) {
        return this.paymentsService.generateMoMoQR(orderId);
    }

    @Post('momo-callback')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle MoMo payment callback' })
    @ApiResponse({ status: 200, description: 'Callback processed successfully' })
    async handleMoMoCallback(
        @Body() callbackData: any,
    ) {
        await this.paymentsService.handleMoMoCallback(callbackData);
        return { success: true };
    }

    @Post('momo-confirm')
    @ApiOperation({ summary: 'Confirm a MoMo payment' })
    @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
    async confirmMoMoPayment(
        @Query('partnerRefId') partnerRefId: string,
        @Query('requestType') requestType: 'capture' | 'revertAuthorize',
    ) {
        const success = await this.paymentsService.confirmMoMoPayment(
            partnerRefId,
            requestType || 'capture'
        );
        return { success };
    }

    @Get('status/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check payment status for an order' })
    @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async checkPaymentStatus(
        @Param('orderId', ParseIntPipe) orderId: number,
    ) {
        return this.paymentsService.checkPaymentStatus(orderId);
    }
} 