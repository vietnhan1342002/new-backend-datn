// schedule.schema.ts

import { ScheduleStatus } from '@/modules/schedule_status/schemas/schedule_status.schema';
import { Shift } from '@/modules/shifts/schemas/shift.schema';
import { UserAuth } from '@/modules/user-auth/schemas/user-auth.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({ timestamps: true })
export class Schedule extends Document {
  @Prop({ type: Types.ObjectId, ref: UserAuth.name, required: true })
  doctorID: Types.ObjectId;

  @Prop()
  date_of_work: Date;

  @Prop({ type: Types.ObjectId, ref: Shift.name, required: true })
  shift: Shift; // 'Sáng', 'Chiều'

  @Prop()
  availability: boolean; // true: có sẵn, false: không có sẵn

  @Prop({ required: true })
  patientTotal: number;

  @Prop({ type: Types.ObjectId, ref: ScheduleStatus.name, required: true })
  schedule_status: ScheduleStatus;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
