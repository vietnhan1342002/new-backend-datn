import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ShiftDocument = HydratedDocument<Shift>;

@Schema({ timestamps: true })
export class Shift extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
