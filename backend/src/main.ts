import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  console.log('Bootstrap starting...');
  const app = await NestFactory.create(AppModule);
  console.log('Nest application created');
  
  // URL versioning
  app.setGlobalPrefix('api/v1');
  
  // Cookie Parser
  app.use(cookieParser());
  
  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Global Filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  console.log(`Attempting to listen on port ${port}...`);
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch(err => {
  console.error('Bootstrap failed!', err);
});
