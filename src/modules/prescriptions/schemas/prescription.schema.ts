
import { DetailMedicalRecord } from '@/modules/detail-medical-record/schemas/detail-medical-record.schema';
import { Medication } from '@/modules/medications/schemas/medication.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Prescription {
    @Prop({ type: Types.ObjectId, ref: DetailMedicalRecord.name, required: true })
    detail_medical_record_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Medication.name, required: true })
    medication_id: Types.ObjectId;

    @Prop({ type: Number, required: true })
    quantity_prescribed: number;


    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date
}

export type PrescriptionDocument = HydratedDocument<Prescription>;
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
