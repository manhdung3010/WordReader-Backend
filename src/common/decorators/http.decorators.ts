import {
  SetMetadata,
  UseGuards,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from './roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthUserInterceptor } from '../interceptors/auth-user-interceptor.service';
import { AdminGuard } from '../guards/admin.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserGuard } from '../guards/user.guard';

export function AuthAdmin(
  ...permission: Role[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    Permission(...permission),
    UseGuards(JwtAuthGuard, AdminGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function AuthUser(
  ...permission: Role[]
): MethodDecorator & ClassDecorator {
  return applyDecorators(
    Permission(...permission),
    UseGuards(JwtAuthGuard, UserGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function Permission(
  ...permission: Role[]
): MethodDecorator & ClassDecorator {
  return SetMetadata(ROLES_KEY, permission);
}
