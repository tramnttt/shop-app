import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeeder {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async seed() {
        // Check if admin already exists
        const existingAdmin = await this.customerRepository.findOne({
            where: { email: 'tramnguyen040404@gmail.com' }
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash('123456', saltRounds);

        const admin = this.customerRepository.create({
            first_name: 'Admin',
            last_name: 'User',
            email: 'tramnguyen040404@gmail.com',
            password_hash: passwordHash,
            created_at: new Date(),
            updated_at: new Date()
        });

        await this.customerRepository.save(admin);
        console.log('Admin user seeded successfully');
    }
} 