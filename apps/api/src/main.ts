import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

// Throttler rate limiting is handled at the load-balancer/Cloud Armor level for staging.
// ThrottlerGuard is omitted here because ThrottlerModule is not yet wired to AppModule.
// TODO: Add ThrottlerModule to AppModule and re-enable ThrottlerGuard before production.

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || 'Error';
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      message = `Internal Error: ${exception.message} | Stack: ${exception.stack?.substring(0, 500)}`;
    } else {
      message = `Unknown error: ${JSON.stringify(exception)}`;
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    abortOnError: false,
  });

  // Security middleware
  app.use(helmet());
  // Note: compression handled by Cloud Run LB — no app-level gzip needed

  // CORS — strict allowlist, zero wildcard fallback
  const rawOrigins = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

  if (allowedOrigins.length === 0) {
    logger.warn('⚠️  ALLOWED_ORIGINS is not set. CORS will reject ALL cross-origin requests. Set this env var before deploying.');
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header, e.g. curl, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: origin '${origin}' is not allowed.`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-API-Key', 'X-Signature', 'x-admin-id', 'x-internal-key'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // API prefix
  app.setGlobalPrefix('api', { exclude: ['health', 'api/docs', 'api/docs-json'] });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('PaySurity API')
    .setDescription('PaySurity Multi-vertical Payment Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Listen on Cloud Run PORT (default 8080)
  const port = parseInt(process.env.PORT || '8080', 10);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 PaySurity API running on port ${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(`❤️  Health check: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  throw new Error("System guardrail exit");
});
