import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * GlobalExceptionFilter — maps all exceptions to the standard error envelope
 * defined in CLAUDE.md §9.
 *
 * Standard error shape:
 * {
 *   "statusCode": 400,
 *   "errorCode": "VALIDATION_ERROR",
 *   "message": "Human-readable description",
 *   "errors": [{ "field": "email", "message": "Must be a valid email" }]
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let errors: unknown[] | undefined;

    // Priority: Body message > Exception message > Default
    const exceptionMessage = (exception as any)?.message || (typeof exception === 'string' ? exception : undefined);

    if (exception instanceof HttpException || (exception && typeof (exception as any).getStatus === 'function')) {
      const httpException = exception as HttpException;
      statusCode = httpException.getStatus();
      const exceptionResponse = httpException.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        errorCode = (body.errorCode as string) || this.statusToErrorCode(statusCode);
        message = (body.message as string) || exceptionMessage || message;
        errors = body.errors as unknown[] | undefined;
      } else {
        message = (exceptionResponse as string) || exceptionMessage || message;
        errorCode = this.statusToErrorCode(statusCode);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    } else {
      message = exceptionMessage || message;
      this.logger.error(`Unknown exception type caught: ${typeof exception}`, exception);
    }

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      410: 'GONE',
      422: 'BUSINESS_RULE_ERROR',
      500: 'INTERNAL_ERROR',
      503: 'AI_UNAVAILABLE',
    };
    return map[status] || 'INTERNAL_ERROR';
  }
}
