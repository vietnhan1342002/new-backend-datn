import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePrescriptionDto {
    @IsMongoId()
    @IsNotEmpty()
    @Type(() => Types.ObjectId)
    detailMedicalRecordId: Types.ObjectId; 

}
