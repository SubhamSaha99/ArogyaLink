import { applyDecorators, UseGuards } from '@nestjs/common';

import { Roles } from './roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../util/constant';

export function Auth(...roles: UserRole[]) {
  const decorators = [UseGuards(JwtAuthGuard)];

  if (roles.length > 0) {
    decorators.push(
      Roles(...roles),
      UseGuards(RolesGuard),
    );
  }

  return applyDecorators(...decorators);
}