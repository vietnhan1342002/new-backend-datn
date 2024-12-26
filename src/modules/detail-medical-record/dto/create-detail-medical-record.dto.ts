import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateDetailMedicalRecordDto {
    @IsMongoId()
    @IsNotEmpty()
    medicalRecordId: Types.ObjectId; 

    @IsOptional()
    symptoms?: string;  

    @IsOptional()
    disease?: string; 
    @IsOptional()
    treatmentPlan?: string;  
}
