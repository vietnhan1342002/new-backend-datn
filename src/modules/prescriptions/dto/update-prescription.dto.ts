import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";


export class UpdatePrescriptionDto {
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    detailMedicalRecordId: Types.ObjectId; // Liên kết đến bệnh án chi tiết
}
