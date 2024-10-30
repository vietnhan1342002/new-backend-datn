import { AppointmentStatus } from '@/modules/appointment_status/schemas/appointment_status.schema';
import { Patient } from '@/modules/patients/schemas/patient.schema';
import { Shift } from '@/modules/shifts/schemas/shift.schema';
import { UserAuth } from '@/modules/user-auth/schemas/user-auth.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: Patient.name, required: true })
  patientID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserAuth.name, required: true })
  doctorID: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ type: Types.ObjectId, ref: Shift.name, required: true })
  shiftID: Date;

  @Prop({ type: Types.ObjectId, ref: AppointmentStatus.name, required: true })
  statusID: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
