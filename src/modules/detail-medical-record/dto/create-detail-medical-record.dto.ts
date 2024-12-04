import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateDetailMedicalRecordDto {
    @IsMongoId()
    @IsNotEmpty()
    medicalRecordId: Types.ObjectId;  // ID của MedicalRecord mà bản ghi chi tiết này liên kết

    @IsString()
    symptoms: string;  // Triệu chứng của bệnh nhân

    @IsString()
    disease: string;  // Tên bệnh được chẩn đoán

    @IsString()
    treatmentPlan: string;  // Kế hoạch điều trị cho bệnh nhân
}
