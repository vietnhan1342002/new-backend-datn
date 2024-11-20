import {
  IsEmail,
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateUserAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email cannot be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @IsNotEmpty({ message: 'fullName cannot be empty' })
  fullName: string;

  @IsNotEmpty({ message: 'phoneNumber cannot be empty' })
  phoneNumber: string;

  @IsOptional()
  roleId: string;
}
