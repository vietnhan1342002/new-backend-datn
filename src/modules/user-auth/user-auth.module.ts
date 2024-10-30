import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuth, UserAuthSchema } from './schemas/user-auth.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    //schema
    MongooseModule.forFeature([
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService],
  exports: [UserAuthService],
})
export class UserAuthModule {}
