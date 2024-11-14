// update-patient-user.dto.ts
import { UpdateUserAuthDto } from '@/modules/user-auth/dto/update-user-auth.dto';
import { UpdatePatientDto } from './update-patient.dto';
import { IsObject, IsOptional } from 'class-validator';

export class UpdatePatientUserDto {
  @IsOptional()
  @IsObject() // Đảm bảo rằng nó là đối tượng
  patient: UpdatePatientDto;

  @IsOptional()
  @IsObject() // Đảm bảo rằng nó là đối tượng
  userAuth: UpdateUserAuthDto;
}
