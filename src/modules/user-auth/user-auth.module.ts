import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuth, UserAuthSchema } from './schemas/user-auth.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '@/config/auth.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from '../roles/roles.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig,
      inject: [ConfigService],
    }),

    //schema
    MongooseModule.forFeature([
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    PassportModule,
    RolesModule,
  ],
  controllers: [UserAuthController],
  providers: [
    UserAuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [UserAuthService],
})
export class UserAuthModule {}
