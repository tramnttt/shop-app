import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'password',
            database: 'jewelry_shop',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true, // set to false in production
        }),
    ],
})
export class DatabaseModule { } 