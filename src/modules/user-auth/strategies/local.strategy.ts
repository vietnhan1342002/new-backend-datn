import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserAuthService } from '../user-auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userAuthService: UserAuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('INSIDE AUTHEN');
    const user = await this.userAuthService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email / Password không hợp lệ');
    }
    return user;
  }
}
