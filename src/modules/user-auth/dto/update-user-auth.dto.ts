import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAuthDto } from './create-user-auth.dto';
import { IsMongoId, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class UpdateUserAuthDto {
  @IsOptional()
  fullName?: string;

  @IsOptional()
  roleId?: string;

  @Length(10)
  @IsOptional()
  phoneNumber?: string;
}
