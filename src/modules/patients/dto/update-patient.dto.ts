import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../schemas/patient.schema';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  email?: string;

  @IsOptional() // Trường này không bắt buộc
  @IsDateString()
  dateOfBirth?: string; // Chỉ cần cập nhật nếu muốn

  @IsOptional() // Trường này không bắt buộc
  @IsString()
  address?: string; // Chỉ cần cập nhật nếu muốn

  @IsOptional() // Trường này không bắt buộc
  @IsEnum(Gender)
  gender?: Gender; // Chỉ cần cập nhật nếu muốn
}
