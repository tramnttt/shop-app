import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.customersRepository.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.customer_id,
            role: user.role || 'customer'
        };

        // Update last login
        await this.customersRepository.update(
            user.customer_id,
            { last_login: new Date() }
        );

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.customer_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role || 'customer'
            }
        };
    }

    async register(userData: any) {
        // Check if user already exists
        const existingUser = await this.customersRepository.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);

        // Create new user
        const newUser = this.customersRepository.create({
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            password_hash: passwordHash,
            phone: userData.phone,
            role: 'customer',
            created_at: new Date(),
        });

        const savedUser = await this.customersRepository.save(newUser);
        const { password_hash, ...result } = savedUser;

        return this.login(result);
    }
} 