import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Bootstrap starting...');
  const app = await NestFactory.create(AppModule);
  logger.log('Nest application created');

  // URL versioning
  app.setGlobalPrefix('api/v1');

  // Cookie Parser
  app.use(cookieParser());

  // CORS — must be registered BEFORE helmet
  const frontendUrl = process.env.FRONTEND_URL;
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv !== 'development' && !frontendUrl) {
    throw new Error(
      'FRONTEND_URL environment variable is required in production',
    );
  }

  app.enableCors({
    origin: frontendUrl || 'http://localhost:5173',
    credentials: true,
  });

  // Helmet — applied AFTER CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }),
  );

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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Bootstrap failed!', err);
});

