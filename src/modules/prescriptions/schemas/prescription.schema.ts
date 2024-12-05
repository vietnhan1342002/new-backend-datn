
import { DetailMedicalRecord } from '@/modules/detail-medical-record/schemas/detail-medical-record.schema';
import { Medication } from '@/modules/medications/schemas/medication.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Prescription {
    @Prop({ type: Types.ObjectId, ref: DetailMedicalRecord.name, required: true })
    detailMedicalRecordId: Types.ObjectId;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date
}

export type PrescriptionDocument = HydratedDocument<Prescription>;
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
