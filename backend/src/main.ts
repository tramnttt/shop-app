import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminSeeder } from './database/seeders/admin.seeder';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Increase JSON payload size limit for handling base64 encoded images
    app.use(require('body-parser').json({ limit: '50mb' }));
    app.use(require('body-parser').urlencoded({ limit: '50mb', extended: true }));

    // Configure global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            // Enable type conversion for primitive types
            exposeDefaultValues: true,
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
        stopAtFirstError: false,   // Continue validation to collect all errors
        validationError: {
            target: false,
            value: true
        },
        exceptionFactory: (errors) => {
            console.log('Validation errors:', JSON.stringify(errors, null, 2));
            const { BadRequestException } = require('@nestjs/common');
            return new BadRequestException(errors);
        }
    }));

    // Configure CORS - more permissive settings for development
    app.enableCors({
        origin: true, // Allow all origins in development 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    });

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

    // Serve static files from uploads directory
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    // Set API prefix for all endpoints
    app.setGlobalPrefix('api');

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap(); 