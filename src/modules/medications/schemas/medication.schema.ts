import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Medication {
    @Prop({ unique: true, required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    usageInstructions: string;

    @Prop()
    sideEffects: string;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    minQuantity: number;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ required: true })
    unit: string;
}
export type MedicationDocument = HydratedDocument<Medication>;
export const MedicationSchema = SchemaFactory.createForClass(Medication);
