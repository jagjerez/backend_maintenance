import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalAuthGuard } from './auth/guards/global-auth.guard';
import { AuthService } from './auth/auth.service';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global authentication guard
  const authService = app.get(AuthService);
  app.useGlobalGuards(new GlobalAuthGuard(reflector, authService));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Backend App Maintenance API')
    .setDescription(
      'A comprehensive NestJS backend API with MongoDB, file storage, and cron jobs',
    )
    .setVersion('1.0.0')
    .addTag('Operations', 'Operations management endpoints')
    .addTag('Locations', 'Locations management endpoints')
    .addTag('Users', 'Users management endpoints')
    .addTag('Integration Jobs', 'Integration jobs management endpoints')
    .addTag('Companies', 'Companies management endpoints')
    .addTag('Accounts', 'Accounts management endpoints')
    .addTag('Subscriptions', 'Subscriptions management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Authentication and authorization endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Expose Swagger JSON
  app.use('/swaggerDocument', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

void bootstrap();
