import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsOptional()
  @IsNotEmpty({ message: 'licenseNumber cannot be empty' })
  @IsString({ message: 'licenseNumber phải là một chuỗi' })
  licenseNumber?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'yearsOfExperience cannot be empty' })
  @Min(1, { message: 'yearsOfExperience phải lớn hơn 0' })
  @Type(() => Number)
  yearsOfExperience?: number;

  @IsOptional()
  @IsNotEmpty({ message: 'specialtyId cannot be empty' })
  @IsMongoId({ message: 'specialtyId invalid' })
  specialty?: string | Types.ObjectId;
}
