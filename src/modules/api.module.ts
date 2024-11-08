import { Module } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { DepartmentsModule } from './departments/departments.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from '@/config/mongoose.config';
import { jwtConfig } from '@/config/auth.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user-auth/guard/jwt-auth.guard';
import { JwtStrategy } from './user-auth/strategies/jwt.strategy';
import { DoctorsModule } from './doctors/doctors.module';

@Module({
  imports: [
    // Cấu hình chung
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),

    // Kết nối MongoDB
    MongooseModule.forRootAsync({
      useFactory: mongooseConfig,
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtConfig,
      inject: [ConfigService],
    }),

    UserAuthModule,
    RolesModule,
    PatientsModule,
    MedicalRecordsModule,
    DepartmentsModule,
    DoctorsModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class ApiModule {}
