import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: {
        sub: string;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
    }>();
    const authHeader = request.headers.authorization as string;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    const hasPermissions = await this.authService.checkUserPermissions(
      token,
      requiredPermissions,
    );

    if (!hasPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
