import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextHttp = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data: any) => {
        contextHttp.header('X-Frame-Options', 'SAMEORIGIN');
        return data;
      }),
    );
  }
}
