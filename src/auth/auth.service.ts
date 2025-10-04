import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly oauth2ServerUrl: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.oauth2ServerUrl =
      this.configService.get<string>('oauth2.serverUrl') ||
      'https://oauth2-application.vercel.app';
  }

  async validateToken(token: string): Promise<{
    sub: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  }> {
    try {
      // Verificar el token contra el servidor OAuth2
      const response = await fetch(`${this.oauth2ServerUrl}/api/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Token validation failed: ${response.status} ${response.statusText}`,
        );
        throw new UnauthorizedException('Invalid token');
      }

      const userData = (await response.json()) as {
        sub: string;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
      this.logger.log(
        `Token validated successfully for user: ${userData.username}`,
      );

      return userData;
    } catch (error) {
      this.logger.error('Error validating token:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  async getUserInfo(token: string): Promise<{
    sub: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  }> {
    try {
      const response = await fetch(`${this.oauth2ServerUrl}/api/userinfo`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Failed to get user info');
      }

      return (await response.json()) as {
        sub: string;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
    } catch (error) {
      this.logger.error('Error getting user info:', error);
      throw new UnauthorizedException('Failed to get user info');
    }
  }

  async checkUserPermissions(
    token: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(token);
      const userPermissions = userInfo.permissions || [];

      // Verificar si el usuario tiene todas las permisos requeridos
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      return hasAllPermissions;
    } catch (error) {
      this.logger.error('Error checking permissions:', error);
      return false;
    }
  }

  async checkUserRoles(
    token: string,
    requiredRoles: string[],
  ): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(token);
      const userRoles = userInfo.roles || [];

      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      return hasRequiredRole;
    } catch (error) {
      this.logger.error('Error checking roles:', error);
      return false;
    }
  }
}
