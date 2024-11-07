import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsMongoId, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsNotEmpty({ message: 'licenseNumber không được để trống' })
  @IsString({ message: 'licenseNumber phải là một chuỗi' })
  licenseNumber: string;

  @IsNotEmpty({ message: 'yearsOfExperience không được để trống' })
  @Min(1, { message: 'yearsOfExperience phải lớn hơn 0' }) // Kiểm tra số năm kinh nghiệm phải > 0
  yearsOfExperience: number;

  @IsMongoId({ message: 'departmentId không hợp lệ' })
  @IsNotEmpty({ message: 'departmentId không được để trống' })
  departmentId: string;
}
