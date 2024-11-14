import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsMongoId, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsNotEmpty({ message: 'licenseNumber cannot be empty' })
  @IsString({ message: 'licenseNumber phải là một chuỗi' })
  licenseNumber?: string;

  @IsNotEmpty({ message: 'yearsOfExperience cannot be empty' })
  @Min(1, { message: 'yearsOfExperience phải lớn hơn 0' }) // Kiểm tra số năm kinh nghiệm phải > 0
  yearsOfExperience?: number;

  @IsNotEmpty({ message: 'specialtyId cannot be empty' })
  @IsMongoId({ message: 'specialtyId invalid' })
  specialty?: string;
}
