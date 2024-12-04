import { IsOptional, IsString } from "class-validator";


export class UpdateDetailMedicalRecordDto {
    @IsOptional()
    @IsString()
    symptoms: string;  // Triệu chứng của bệnh nhân
    @IsOptional()
    @IsString()
    disease: string;  // Tên bệnh được chẩn đoán
    @IsOptional()
    @IsString()
    treatmentPlan: string;  // Kế hoạch điều trị cho bệnh nhân
}
