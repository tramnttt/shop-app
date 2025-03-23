import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { AdminSeeder } from './database/seeders/admin.seeder';
import { Customer } from './entities/customer.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([Customer]),
        ProductsModule,
        CategoriesModule,
        AuthModule,
    ],
    controllers: [],
    providers: [AdminSeeder],
})
export class AppModule { } 