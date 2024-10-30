import { Patient } from '@/modules/patients/schemas/patient.schema';
import { UserAuth } from '@/modules/user-auth/schemas/user-auth.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MedicalRecordDocument = HydratedDocument<MedicalRecord>;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: Patient.name, required: true })
  patientID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: UserAuth.name, required: true })
  doctorID: Types.ObjectId;

  @Prop({ required: true })
  symptoms: string;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ required: true })
  prescriptions: string;

  @Prop({ required: true })
  note: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
