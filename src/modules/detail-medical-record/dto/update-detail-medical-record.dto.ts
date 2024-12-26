import { IsOptional, IsString } from "class-validator";


export class UpdateDetailMedicalRecordDto {
    @IsOptional()
    @IsString()
    symptoms: string; 
    @IsOptional()
    @IsString()
    disease: string; 
    @IsOptional()
    @IsString()
    treatmentPlan: string; 
}
