import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

// Định nghĩa kiểu dữ liệu của document
export type SpecialtyDocument = HydratedDocument<Specialty>;

@Schema({ timestamps: true })
export class Specialty extends Document {
  @Prop({ required: true, unique: true })
  name: string; // Tên chuyên khoa

  @Prop({ required: false })
  description: string; // Mô tả chuyên khoa
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty);
