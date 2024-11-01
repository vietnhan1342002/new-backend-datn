import { Module } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import { ShiftsModule } from './shifts/shifts.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { DepartmentsModule } from './departments/departments.module';
import { AppointmentStatusModule } from './appointment_status/appointment_status.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleStatusModule } from './schedule_status/schedule_status.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from '@/config/mongoose.config';
import { jwtConfig } from '@/config/auth.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './user-auth/guard/jwt-auth.guard';
import { JwtStrategy } from './user-auth/strategies/jwt.strategy';

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
    AppointmentStatusModule,
    SchedulesModule,
    ScheduleStatusModule,
    ShiftsModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class ApiModule {}
