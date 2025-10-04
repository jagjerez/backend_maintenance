import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    try {
      // Extraer el token del header Authorization
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verificar el token contra el servidor OAuth2
      const user = await this.authService.validateToken(token);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Agregar información del usuario al request
      req.user = user;

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
