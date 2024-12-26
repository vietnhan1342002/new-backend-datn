import { forwardRef, Module } from '@nestjs/common';
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
import { PatientsModule } from '../patients/patients.module';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';
import { Doctor, DoctorSchema } from '../doctors/schemas/doctor.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig,
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: UserAuth.name, schema: UserAuthSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Doctor.name, schema: DoctorSchema },
    ]),
    PassportModule,
    RolesModule,
    forwardRef(() => PatientsModule),
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
export class UserAuthModule { }
