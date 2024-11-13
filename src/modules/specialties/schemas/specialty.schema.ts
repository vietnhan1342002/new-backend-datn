import { Department } from '@/modules/departments/schemas/department.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

// Định nghĩa kiểu dữ liệu của document
export type SpecialtyDocument = HydratedDocument<Specialty>;

@Schema({ timestamps: true })
export class Specialty extends Document {
  @Prop({ required: true, unique: true })
  name: string; // Tên chuyên khoa

  @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
  departmentId: Types.ObjectId;

  @Prop({
    type: {
      introduction: String,
      qualifications: [String],
      relatedDiseases: [String],
    },
    required: true,
  })
  description: {
    introduction: string;
    qualifications: string[];
    relatedDiseases: string[];
  };
  // Mô tả chuyên khoa
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty);
