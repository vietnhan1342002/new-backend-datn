import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';

export const JwtStrategyConfig = (configService: ConfigService) => ({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: true,
  secretOrKey: configService.get<string>('JWT_SECRET'),
});

export const jwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
  },
});
