import { IsEmail, IsEmpty, IsNotEmpty, Length } from 'class-validator';

export class CreateUserAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email cannot be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  fullName?: string;
  phoneNumber?: string;
}
