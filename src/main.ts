import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalAuthGuard } from './auth/guards/global-auth.guard';
import { AuthService } from './auth/auth.service';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function createNestApp(): Promise<INestApplication> {
  if (app) return app;

  app = await NestFactory.create(AppModule);
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

  await app.init();
  return app;
}

// Solo ejecutar bootstrap en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  void createNestApp().then(async (app) => {
    const configService = app.get(ConfigService);
    const port = Number(configService.get('port')) || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  });
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  const nestApp = await createNestApp();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  nestApp.getHttpAdapter().getInstance()(req, res);
}
