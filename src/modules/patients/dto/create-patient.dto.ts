import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Gender } from '../schemas/patient.schema';

export class CreatePatientDto {
  @IsMongoId({ message: 'userId invalid' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  address?: string;

  @IsEnum(Gender)
  gender?: Gender;
}
