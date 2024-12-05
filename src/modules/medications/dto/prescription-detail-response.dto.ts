import { IsMongoId, IsBoolean, IsDate, IsOptional, IsInt } from 'class-validator';
import { Types } from 'mongoose';

export class PrescriptionDetailResponseDto {

    @IsMongoId()
    _id: Types.ObjectId

    @IsMongoId()
    prescriptionId: Types.ObjectId;

    @IsMongoId()
    medicationId: Types.ObjectId;

    @IsOptional()
    @IsInt()
    quantityPrescribed: number;

    constructor(data: Partial<PrescriptionDetailResponseDto>) {
        Object.assign(this, data);
    }

}
