import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ShiftDocument = HydratedDocument<Shift>;

@Schema({ timestamps: true })
export class Shift {
    @Prop({ required: true })
    shiftName: string;  // Tên Shift, ví dụ: "morning", "afternoon"
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);