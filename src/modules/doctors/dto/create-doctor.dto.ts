import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
  @IsMongoId({ message: 'userId invalid' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId: string;

  @IsNotEmpty({ message: 'licenseNumber cannot be empty' })
  licenseNumber: string;

  @IsNotEmpty({ message: 'yearsOfExperience cannot be empty' })
  yearsOfExperience: number;

  @IsMongoId({ message: 'specialtyId invalid' })
  @IsNotEmpty({ message: 'specialtyId cannot be empty' })
  specialtyId: string;
}
