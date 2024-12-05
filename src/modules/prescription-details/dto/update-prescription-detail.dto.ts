import { IsInt, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class UpdatePrescriptionDetailDto {
    @IsOptional()
    @IsMongoId()
    prescriptionId?: Types.ObjectId;

    @IsOptional()
    @IsMongoId()
    medicationId?: Types.ObjectId;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    quantityPrescribed?: number;
}
