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
    prescriptionId: string; // Liên kết đến đơn thuốc

    @Prop()
    patientName: string; // Liên kết đến bệnh nhân

    @Prop({ required: true })
    totalPrice: number; // Tổng giá trị hóa đơn

    @Prop({ enum: BillStatus, default: BillStatus.PENDING })
    status: BillStatus; // Trạng thái hóa đơn

    @Prop({ required: false })
    paymentDate: Date; // Ngày thanh toán, nếu có
}

export const BillSchema = SchemaFactory.createForClass(Bill);
export type BillDocument = HydratedDocument<Bill>;