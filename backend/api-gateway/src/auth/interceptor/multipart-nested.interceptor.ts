import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MultipartNestedInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const body = request.body;

    if (!body || typeof body !== 'object') {
      return next.handle();
    }

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(body)) {
      const match = key.match(/^([^[\]]+)\[(\d+)\]\.(.+)$/);

      if (!match) {
        result[key] = value;
        continue;
      }

      const [, arrayName, index, field] = match;

      result[arrayName] ??= [];
      result[arrayName][Number(index)] ??= {};

      result[arrayName][Number(index)][field] = value;
    }

    request.body = result;

    return next.handle();
  }
}