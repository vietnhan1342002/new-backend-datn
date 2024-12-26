import { UpdateUserAuthDto } from '@/modules/user-auth/dto/update-user-auth.dto';
import { UpdatePatientDto } from './update-patient.dto';
import { IsObject, IsOptional } from 'class-validator';

export class UpdatePatientUserDto {
  @IsOptional()
  @IsObject()
  patient: UpdatePatientDto;

  @IsOptional()
  @IsObject()
  userAuth: UpdateUserAuthDto;
}
