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

@Module({
  imports: [
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
})
export class ApiModule {}
