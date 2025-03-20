import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { AdminSeeder } from './admin.seeder';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeederModule);

    try {
        console.log('Starting database seeding...');
        const adminSeeder = app.get(AdminSeeder);
        await adminSeeder.seed();
        console.log('Database seeding completed.');
    } catch (error) {
        console.error('Database seeding failed:', error);
        throw error;
    } finally {
        await app.close();
    }
}

bootstrap(); 