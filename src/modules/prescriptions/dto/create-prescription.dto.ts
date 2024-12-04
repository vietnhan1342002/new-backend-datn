import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePrescriptionDto {
    @IsMongoId()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    detailMedicalRecordId: Types.ObjectId; // Liên kết đến bệnh án chi tiết

    @IsMongoId()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    medicationId: Types.ObjectId; // Liên kết đến thuốc

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    quantityPrescribed: number; // Số lượng thuốc được kê

}
