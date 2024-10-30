import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppointmentStatusDocument = HydratedDocument<AppointmentStatus>;

@Schema({ timestamps: true })
export class AppointmentStatus {
    @Prop({ required: true })
    appointmentStatusName: string;  // Tên AppointmentStatus, ví dụ: "empty", "fullfield"
}

export const AppointmentStatusSchema = SchemaFactory.createForClass(AppointmentStatus);