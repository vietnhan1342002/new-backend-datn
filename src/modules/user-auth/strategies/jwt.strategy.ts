import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategyConfig } from '@/config/auth.config';
import { UserAuthService } from '../user-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userAuthService: UserAuthService,
  ) {
    super(JwtStrategyConfig(configService));
  }

  async validate(payload: any) {
    const user = await this.userAuthService.findById(payload.userId); // Giả sử bạn có phương thức này trong service
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
