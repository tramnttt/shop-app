import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminSeeder } from './database/seeders/admin.seeder';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');

    // Run admin seeder
    try {
        const adminSeeder = app.get(AdminSeeder);
        await adminSeeder.seed();
        console.log('Admin user seed check completed.');
    } catch (error) {
        console.error('Error checking/creating admin user:', error);
    }

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('Jewelry Shop API')
        .setDescription('The Jewelry Shop API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap(); 