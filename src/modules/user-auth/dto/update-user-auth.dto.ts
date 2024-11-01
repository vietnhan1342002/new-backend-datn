import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAuthDto } from './create-user-auth.dto';
import { IsMongoId, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class UpdateUserAuthDto extends PartialType(CreateUserAuthDto) {
  @IsOptional()
  fullName: string;

  @Length(10)
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  @IsNotEmpty({ message: '_id phòng ban không được để trống' })
  @IsMongoId({ message: '_id phòng ban không hợp lệ' })
  departmentID: string;
}
