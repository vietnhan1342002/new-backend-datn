import { IsDateString, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Gender } from '../schemas/patient.schema';

export class CreatePatientDto {
  @IsMongoId({ message: 'userId invalid' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId?: string;

  @IsNotEmpty({ message: 'dateOfBirth cannot be empty' })
  @IsDateString()
  dateOfBirth?: string;

  @IsNotEmpty({ message: 'address cannot be empty' })
  address?: string;

  @IsEnum(Gender)
  gender?: Gender;
}
