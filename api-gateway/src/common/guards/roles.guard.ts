import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../utils/constant';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You are not authorized to access this resource.',
      );
    }

    return true;
  }
}
