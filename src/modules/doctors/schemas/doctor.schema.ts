import { Department } from '@/modules/departments/schemas/department.schema';
import { Specialty } from '@/modules/specialties/schemas/specialty.schema';
import { UserAuth } from '@/modules/user-auth/schemas/user-auth.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({ timestamps: true })
export class Doctor extends Document {
  @Prop({ type: Types.ObjectId, ref: UserAuth.name, required: true })
  userId: Types.ObjectId;

  @Prop({})
  licenseNumber: string;

  @Prop({})
  yearsOfExperience: number;

  @Prop({ type: Types.ObjectId, ref: Specialty.name })
  specialtyId: Types.ObjectId;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
