import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  
    
    return next.handle().pipe(
      map(data => {
        // Mẫu response mong muốn
  
        return {
          statusCode: 200,
          message: data.message || 'Success',
          data: data.data || null,
            totalCount: data.totalCount || null
        };
      }),
    );
  }
}