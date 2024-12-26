import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../schemas/patient.schema';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
