import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let statusCode: number;
    let message: any;

    // HTTP Exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const payload = exception.getResponse();

      response.status(statusCode).json({
        statusCode,
        timestamp: new Date().toISOString(),
        ...(typeof payload === 'object'
          ? payload
          : { message: payload }),
      });

      return;
    }

    // gRPC Exceptions
    switch (exception?.code) {
      case GrpcStatus.INVALID_ARGUMENT:
        statusCode = HttpStatus.BAD_REQUEST;
        break;

      case GrpcStatus.UNAUTHENTICATED:
        statusCode = HttpStatus.UNAUTHORIZED;
        break;

      case GrpcStatus.PERMISSION_DENIED:
        statusCode = HttpStatus.FORBIDDEN;
        break;

      case GrpcStatus.NOT_FOUND:
        statusCode = HttpStatus.NOT_FOUND;
        break;

      case GrpcStatus.ALREADY_EXISTS:
        statusCode = HttpStatus.CONFLICT;
        break;

      case GrpcStatus.FAILED_PRECONDITION:
        statusCode = HttpStatus.PRECONDITION_FAILED;
        break;

      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
    }

    message =
      exception?.details ??
      exception?.message ??
      'Internal server error';

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}