import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the handler already returned an object with success or data/message envelope
        if (res && typeof res === 'object') {
          if ('success' in res && 'data' in res) {
            return {
              success: res.success,
              message: res.message || 'Operation successful',
              data: res.data,
            };
          }
          if ('message' in res && 'data' in res) {
            return {
              success: true,
              message: res.message,
              data: res.data,
            };
          }
          if ('data' in res && Object.keys(res).length === 1) {
            return {
              success: true,
              message: 'Operation successful',
              data: res.data,
            };
          }
        }
        return {
          success: true,
          message: 'Operation successful',
          data: res !== undefined ? res : null,
        };
      }),
    );
  }
}
