import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Wraps every successful response in a consistent envelope. Responses that already
 * provide `data`/`meta` (paginated list endpoints) are passed through unchanged.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | T> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map((payload) => {
        if (payload && typeof payload === 'object' && 'meta' in payload && 'data' in payload) {
          return { success: true, ...payload };
        }
        return { success: true, data: payload };
      }),
    );
  }
}
