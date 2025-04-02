import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('vietqr/generate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate VietQR code for payment' })
    @ApiResponse({ status: 200, description: 'Returns QR code data' })
    async generateVietQR(@Body() body: { orderId: number; amount: number }) {
        return this.paymentsService.generateVietQR(body.orderId, body.amount);
    }

    @Post('momo/generate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate MoMo QR code for payment' })
    @ApiResponse({ status: 200, description: 'Returns QR code data' })
    async generateMoMoQR(@Body() body: { orderId: number }) {
        return this.paymentsService.generateMoMoQR(body.orderId);
    }

    @Get('status/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check payment status' })
    @ApiResponse({ status: 200, description: 'Returns payment status' })
    async checkPaymentStatus(@Param('orderId') orderId: string) {
        return this.paymentsService.checkPaymentStatus(parseInt(orderId, 10));
    }
} 