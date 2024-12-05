import { IsInt, IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreatePrescriptionDetailDto {
    @IsMongoId()
    @IsNotEmpty()
    prescriptionId: Types.ObjectId;

    @IsMongoId()
    @IsNotEmpty()
    medicationId: Types.ObjectId;

    @IsInt()
    @IsNotEmpty()
    quantityPrescribed: number;
}
