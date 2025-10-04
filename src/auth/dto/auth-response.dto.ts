import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class UserSessionDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User preferences',
    example: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
      },
    },
  })
  preferences: {
    theme: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

export class CompanySessionDto {
  @ApiProperty({
    description: 'Company ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  name: string;

  @ApiProperty({
    description: 'Company logo URL',
    example: 'https://example.com/logo.png',
  })
  logo?: string;

  @ApiProperty({
    description: 'Company branding',
    example: {
      appName: 'My App',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
    },
  })
  branding: {
    appName: string;
    logo?: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
  };

  @ApiProperty({
    description: 'Company settings',
    example: {
      allowUserRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'user',
    },
  })
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
  };
}

export class SubscriptionSessionDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Subscription name',
    example: 'Basic Plan',
  })
  name: string;

  @ApiProperty({
    description: 'Subscription description',
    example: 'Basic subscription plan',
  })
  description?: string;

  @ApiProperty({
    description: 'Entity limits',
    example: [
      { entity: 'users', createLimitRegistry: 1000 },
      { entity: 'operations', createLimitRegistry: 5000 },
    ],
  })
  settings: Array<{
    entity: string;
    createLimitRegistry: number;
  }>;
}

export class SessionDto {
  @ApiProperty({
    description: 'User session data',
    type: UserSessionDto,
  })
  user: UserSessionDto;

  @ApiProperty({
    description: 'Company session data',
    type: CompanySessionDto,
  })
  company: CompanySessionDto;

  @ApiProperty({
    description: 'Subscription session data',
    type: SubscriptionSessionDto,
  })
  subscription: SubscriptionSessionDto;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Session data',
    type: SessionDto,
  })
  session: SessionDto;
}
