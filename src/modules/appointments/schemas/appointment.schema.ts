import { DoctorSchedule } from '@/modules/doctor-schedules/schemas/doctor-schedule.schema';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Patient } from '@/modules/patients/schemas/patient.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export enum Status {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {

  @Prop({ type: Types.ObjectId, ref: Patient.name, required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Doctor.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: DoctorSchedule.name, required: true })
  doctorScheduleId: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: string;

  @Prop({})
  reason: string;

  @Prop({ enum: Status, required: true, default: Status.PENDING })
  status: Status;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
