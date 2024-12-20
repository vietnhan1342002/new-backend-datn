import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { DoctorSchedulesModule } from '../doctor-schedules/doctor-schedules.module';
import { MedicalRecordsModule } from '../medical_records/medical_records.module';
import { NotificationsGateway } from '@/notification.gateway';
import { PatientsModule } from '../patients/patients.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    UserAuthModule,
    DoctorSchedulesModule,
    MedicalRecordsModule,
    PatientsModule,
    DoctorsModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, NotificationsGateway],
  exports: [AppointmentsService]
})
export class AppointmentsModule { }
