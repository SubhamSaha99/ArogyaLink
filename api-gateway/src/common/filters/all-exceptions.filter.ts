import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Response } from 'express';

interface HttpErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

interface GrpcException {
  code?: number;
  details?: string;
  message?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // HTTP Exceptions
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        response.status(statusCode).json({
          statusCode,
          message: payload,
          timestamp: new Date().toISOString(),
        });

        return;
      }

      if (this.isHttpErrorResponse(payload)) {
        response.status(statusCode).json({
          statusCode,
          timestamp: new Date().toISOString(),
          ...payload,
        });

        return;
      }

      response.status(statusCode).json({
        statusCode,
        message: 'An error occurred',
        timestamp: new Date().toISOString(),
      });

      return;
    }

    // gRPC Exceptions
    const grpcException = this.getGrpcException(exception);

    let statusCode: number;

    switch (grpcException.code) {
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

    const message =
      grpcException.details ?? grpcException.message ?? 'Internal server error';

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private isHttpErrorResponse(
    payload: string | object,
  ): payload is HttpErrorResponse {
    return typeof payload === 'object' && payload !== null;
  }

  private getGrpcException(exception: unknown): GrpcException {
    if (typeof exception !== 'object' || exception === null) {
      return {};
    }

    const error = exception as Record<string, unknown>;

    return {
      code: typeof error.code === 'number' ? error.code : undefined,

      details: typeof error.details === 'string' ? error.details : undefined,

      message: typeof error.message === 'string' ? error.message : undefined,
    };
  }
}
