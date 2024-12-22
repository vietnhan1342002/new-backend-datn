import { Module } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { DepartmentsModule } from './departments/departments.module';

import { DoctorSchedulesModule } from '@/modules/doctor-schedules/doctor-schedules.module';
import { ShiftsModule } from '@/modules/shifts/shifts.module';
import { SpecialtiesModule } from '@/modules/specialties/specialties.module';
import { AppointmentsModule } from '@/modules/appointments/appointments.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from '@/config/mongoose.config';
import { jwtConfig } from '@/config/auth.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './user-auth/strategies/jwt.strategy';
import { DoctorsModule } from './doctors/doctors.module';
import { FilterModule } from './filter/filter.module';
import { SearchModule } from './search/search.module';
import { DetailMedicalRecordModule } from './detail-medical-record/detail-medical-record.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { MedicationsModule } from './medications/medications.module';
import { PrescriptionDetailsModule } from './prescription-details/prescription-details.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfig } from '@/config/mail.config';
import { BillsModule } from './bills/bills.module';

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
    MailerModule.forRootAsync({
      useFactory: () => MailConfig(),
    }),

    UserAuthModule,
    RolesModule,
    PatientsModule,
    MedicalRecordsModule,
    DepartmentsModule,
    DoctorsModule,
    DoctorSchedulesModule,
    ShiftsModule,
    SpecialtiesModule,
    AppointmentsModule,
    FilterModule,
    SearchModule,
    DetailMedicalRecordModule,
    PrescriptionsModule,
    MedicationsModule,
    PrescriptionDetailsModule,
    BillsModule,
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, UserAuthModule],
})
export class ApiModule { }
