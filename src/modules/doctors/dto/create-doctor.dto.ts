import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
  @IsMongoId({ message: 'userId không hợp lệ' })
  @IsNotEmpty({ message: 'userId không được để trống' })
  userId: string;

  @IsNotEmpty({ message: 'licenseNumber không được để trống' })
  licenseNumber: string;

  @IsNotEmpty({ message: 'yearsOfExperience không được để trống' })
  yearsOfExperience: number;

  @IsMongoId({ message: 'departmentId không hợp lệ' })
  @IsNotEmpty({ message: 'departmentId không được để trống' })
  departmentId: string;
}
