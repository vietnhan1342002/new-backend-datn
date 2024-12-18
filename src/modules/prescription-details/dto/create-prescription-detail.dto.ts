import { IsInt, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class CreatePrescriptionDetailDto {
    @IsMongoId()
    @IsNotEmpty()
    prescriptionId: Types.ObjectId;

    @IsMongoId()
    @IsOptional()
    medicationId?: Types.ObjectId;

    @IsInt()
    @IsOptional()
    quantityPrescribed?: number;
}
