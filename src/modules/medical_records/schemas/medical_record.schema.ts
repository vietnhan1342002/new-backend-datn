import { Appointment } from '@/modules/appointments/schemas/appointment.schema';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Patient } from '@/modules/patients/schemas/patient.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: Patient.name, required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Doctor.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Appointment.name, required: true })
  appointmentId: Types.ObjectId;

  @Prop({})
  diagnosis: string;

  @Prop({})
  note: string;

  isDeleted: { type: Boolean, default: false } // Thêm trường này
  deletedAt: { type: Date, default: null }
}

export type MedicalRecordDocument = HydratedDocument<MedicalRecord>;
export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
