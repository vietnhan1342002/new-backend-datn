import { Medication } from '@/modules/medications/schemas/medication.schema';
import { Prescription } from '@/modules/prescriptions/schemas/prescription.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PrescriptionDetail {
    @Prop({ type: Types.ObjectId, ref: Prescription.name, required: true })
    prescriptionId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Medication.name })
    medicationId: Types.ObjectId;

    @Prop({ type: Number, min: 1 })
    quantityPrescribed: number

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deletedAt: Date
}

export type PrescriptionDetailDocument = HydratedDocument<PrescriptionDetail>;
export const PrescriptionDetailSchema = SchemaFactory.createForClass(PrescriptionDetail);
