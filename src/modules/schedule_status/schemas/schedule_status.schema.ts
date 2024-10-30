import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<ScheduleStatus>;

@Schema({ timestamps: true })
export class ScheduleStatus {
    @Prop({ required: true })
    shiftName: string;  // Tên Shift, ví dụ: "morning", "afternoon"
}

export const ScheduleStatusSchema = SchemaFactory.createForClass(ScheduleStatus);