import { IsNotEmpty, IsString, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateDetailMedicalRecordDto {
    @IsMongoId()
    @IsNotEmpty()
    medicalRecordId: Types.ObjectId;  // ID của MedicalRecord mà bản ghi chi tiết này liên kết

    @IsOptional()
    symptoms?: string;  // Triệu chứng của bệnh nhân

    @IsOptional()
    disease?: string;  // Tên bệnh được chẩn đoán

    @IsOptional()
    treatmentPlan?: string;  // Kế hoạch điều trị cho bệnh nhân
}
