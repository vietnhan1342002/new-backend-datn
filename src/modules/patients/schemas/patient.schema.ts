import { MedicalRecord } from '@/modules/medical_records/schemas/medical_record.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
}

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ enum: Gender })
  gender: Gender;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
