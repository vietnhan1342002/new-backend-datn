import { MedicalRecord } from "@/modules/medical_records/schemas/medical_record.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class DetailMedicalRecord {
    @Prop({ type: Types.ObjectId, ref: MedicalRecord.name, required: true })
    medicalRecordId: Types.ObjectId;

    @Prop({})
    symptoms: string;

    @Prop({})
    disease: string;

    @Prop({})
    treatmentPlan: string;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: null })
    deletedAt: Date;
}

export type DetailMedicalRecordDocument = HydratedDocument<DetailMedicalRecord>;
export const DetailMedicalRecordSchema = SchemaFactory.createForClass(DetailMedicalRecord);