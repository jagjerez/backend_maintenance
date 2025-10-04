import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { SessionService } from './session.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionService: SessionService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin((user._id as any).toString());

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Build session data
    const session = await this.sessionService.buildSession(
      (user._id as any).toString(),
    );

    // Generate tokens
    const payload = {
      sub: (user._id as any).toString(),
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: (user._id as any).toString(), type: 'refresh' },
      {
        expiresIn: '7d', // Refresh token lasts 7 days
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
      session,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: registerDto.name,
      role: registerDto.role,
      companyId: registerDto.companyId,
    });

    // Build session data
    const session = await this.sessionService.buildSession(
      (user._id as any).toString(),
    );

    // Generate tokens
    const payload = {
      sub: (user._id as any).toString(),
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: (user._id as any).toString(), type: 'refresh' },
      {
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
      session,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findOne(
        payload.sub,
        payload.companyId,
      );

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Build session data
      const session = await this.sessionService.buildSession(
        (user._id as any).toString(),
      );

      // Generate new tokens
      const newPayload = {
        sub: (user._id as any).toString(),
        email: user.email,
        companyId: user.companyId,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      });

      const newRefreshToken = this.jwtService.sign(
        { sub: (user._id as any).toString(), type: 'refresh' },
        {
          expiresIn: '7d',
        },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(),
        session,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string, companyId: string): Promise<any> {
    const user = await this.usersService.findOne(userId, companyId);
    const session = await this.sessionService.buildSession(userId);

    return {
      user: session.user,
      company: session.company,
      subscription: session.subscription,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    companyId: string,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(
      userId,
      {
        currentPassword,
        newPassword,
      },
      companyId,
    );

    return { message: 'Password changed successfully' };
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '24h';

    // Parse expiration time (e.g., "24h" -> 86400 seconds)
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 86400;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else {
      return parseInt(expiresIn) || 3600;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type === 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
