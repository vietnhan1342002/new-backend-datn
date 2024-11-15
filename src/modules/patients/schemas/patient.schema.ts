import { MedicalRecord } from '@/modules/medical_records/schemas/medical_record.schema';
import { UserAuth } from '@/modules/user-auth/schemas/user-auth.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({ timestamps: true })
export class Patient {
  @Prop({ type: Types.ObjectId, ref: UserAuth.name, required: true })
  userId: Types.ObjectId;

  @Prop({})
  dateOfBirth: Date;

  @Prop({})
  address: string;

  @Prop({ enum: Gender })
  gender: Gender;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
