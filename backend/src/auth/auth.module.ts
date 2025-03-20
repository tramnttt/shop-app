import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Customer } from '../entities/customer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
                },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { } 