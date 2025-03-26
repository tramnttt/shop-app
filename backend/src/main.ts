import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminSeeder } from './database/seeders/admin.seeder';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Configure global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
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
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Set API prefix for all endpoints
    app.setGlobalPrefix('api');

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap(); 