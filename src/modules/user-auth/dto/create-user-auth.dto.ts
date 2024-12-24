import {
  IsNotEmpty,
  IsOptional,

} from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserAuthDto {
  @IsNotEmpty({ message: 'fullName cannot be empty' })
  fullName: string;

  @IsNotEmpty({ message: 'phoneNumber cannot be empty' })
  phoneNumber: string;

  @IsOptional()
  email?: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @IsOptional()
  roleId: Types.ObjectId;
}
