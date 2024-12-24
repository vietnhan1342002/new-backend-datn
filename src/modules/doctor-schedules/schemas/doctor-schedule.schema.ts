import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Shift } from '@/modules/shifts/schemas/shift.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, HydratedDocument, Types } from 'mongoose';

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}

export type DoctorScheduleDocument = HydratedDocument<DoctorSchedule>;
@Schema({ timestamps: true })
export class DoctorSchedule {
  @Prop({ type: Types.ObjectId, ref: Doctor.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Shift.name, required: true })
  shiftId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ enum: Status, required: true, default: Status.ACTIVE })
  status: Status;
}

export const DoctorScheduleSchema =
  SchemaFactory.createForClass(DoctorSchedule);
