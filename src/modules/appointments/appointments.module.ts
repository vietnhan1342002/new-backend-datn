import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { DoctorSchedulesModule } from '../doctor-schedules/doctor-schedules.module';
import { MedicalRecordsModule } from '../medical_records/medical_records.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    UserAuthModule,
    DoctorSchedulesModule,
    MedicalRecordsModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService]
})
export class AppointmentsModule { }
