import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend applications
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global API v1 Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe with custom exception factory matching spec error formats
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const message = firstError?.constraints
          ? Object.values(firstError.constraints)[0]
          : 'Please fill in all fields.';
        return new BadRequestException(message);
      },
    }),
  );

  // Global Uniform Response Envelope Interceptor: { success: true, message: string, data: any }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Standard Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup at /api/v1/docs
  const config = new DocumentBuilder()
    .setTitle('Rafeeq Pet Care Platform API')
    .setDescription('Full RESTful API specification for the Rafeeq platform: Store, Vets, Hosts, Reviews, Pets, Admin')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Rafeeq Backend Server running successfully on http://localhost:${port}/api/v1`);
  logger.log(`Swagger Documentation available at http://localhost:${port}/api/v1/docs`);
}

bootstrap();
