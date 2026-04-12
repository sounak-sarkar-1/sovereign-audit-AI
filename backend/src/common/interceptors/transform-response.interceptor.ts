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
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        // If it's already a success/data envelope, leave as is
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          'data' in response
        ) {
          return response;
        }

        // Handle case where we only have { data, meta }
        if (response && typeof response === 'object' && 'data' in response) {
          return { success: true, ...response };
        }

        // Standard wrapping
        return { success: true, data: response };
      }),
    );
  }
}
