import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Prescription } from '../../prescriptions/schemas/prescription.schema';
import { Patient } from '../../patients/schemas/patient.schema';

export enum BillStatus {
    PENDING = 'pending',
    PAID = 'paid',
}

@Schema({ timestamps: true })
export class Bill {
    @Prop({ type: Types.ObjectId, ref: Prescription.name, required: true })
    prescriptionId: string; 

    @Prop()
    patientName: string; 

    @Prop({ required: true })
    totalPrice: number; 

    @Prop({ enum: BillStatus, default: BillStatus.PENDING })
    status: BillStatus; 

    @Prop({ required: false })
    paymentDate: Date;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
export type BillDocument = HydratedDocument<Bill>;