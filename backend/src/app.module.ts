import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminSeeder } from './database/seeders/admin.seeder';
import { Customer } from './entities/customer.entity';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
            ...dataSourceOptions,
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
        }),
        TypeOrmModule.forFeature([Customer]),
        ProductsModule,
        CategoriesModule,
        AuthModule,
        ReviewsModule,
        OrdersModule,
        PaymentsModule,
    ],
    controllers: [],
    providers: [AdminSeeder],
})
export class AppModule { } 