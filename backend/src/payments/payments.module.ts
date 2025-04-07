import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, Payment]),
        ConfigModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
    exports: [PaymentsService],
})
export class PaymentsModule { } 