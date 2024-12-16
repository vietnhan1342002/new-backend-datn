import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchedule, DoctorScheduleSchema } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Specialty, SpecialtySchema } from '../specialties/schemas/specialty.schema';
import { Doctor, DoctorSchema } from '../doctors/schemas/doctor.schema';
import { MedicalRecord, MedicalRecordSchema } from '../medical_records/schemas/medical_record.schema';
import { MedicalRecordsModule } from '../medical_records/medical_records.module';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Specialty.name, schema: SpecialtySchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    MedicalRecordsModule
  ],
  controllers: [FilterController],
  providers: [FilterService],
  exports: [FilterService]
})
export class FilterModule { }
