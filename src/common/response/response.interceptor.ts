import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { FastifyReply } from 'fastify';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const reply: FastifyReply = httpContext.getResponse();

    return next.handle().pipe(
      map((data) => {
        const elapsed = Date.now() - now;
        reply.header('X-API-Version', '1.0.0');
        reply.header('X-Response-Time', `${elapsed}ms`);
        reply.status(data.status);
        reply.send(data);
      }),
    );
  }
}
