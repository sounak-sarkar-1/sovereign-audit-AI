import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * TransformResponseInterceptor — wraps all successful responses in a { data } envelope.
 * List responses that already include { data, meta } are passed through unchanged.
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        // If the response already has the envelope shape (e.g. paginated list), pass through
        if (
          response &&
          typeof response === 'object' &&
          'data' in response
        ) {
          return response;
        }
        return { data: response };
      }),
    );
  }
}
