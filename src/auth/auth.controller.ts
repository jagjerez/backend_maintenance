import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

interface AuthenticatedRequest {
  user: {
    sub: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return {
      user: req.user,
      message: 'Profile retrieved successfully',
    };
  }

  @Post('verify-token')
  @Public()
  @ApiOperation({ summary: 'Verify JWT token against OAuth2 server' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  async verifyToken(@Body() body: { token: string }) {
    try {
      const user = await this.authService.validateToken(body.token);
      return {
        valid: true,
        user,
        message: 'Token is valid',
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Token is invalid',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('userinfo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get detailed user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserInfo(@Request() req: AuthenticatedRequest) {
    const authHeader = req.headers.authorization as string;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    const userInfo = await this.authService.getUserInfo(token);
    return userInfo;
  }
}
