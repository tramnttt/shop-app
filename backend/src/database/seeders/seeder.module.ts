import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Customer } from '../../entities/customer.entity';
import { AdminSeeder } from './admin.seeder';
import { databaseConfig } from '../../config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([Customer]),
    ],
    providers: [AdminSeeder],
    exports: [AdminSeeder],
})
export class SeederModule { } 