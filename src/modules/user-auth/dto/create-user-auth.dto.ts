import { IsEmail, IsEmpty, IsNotEmpty, Length } from 'class-validator';

export class CreateUserAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;

  fullName: string;
  phoneNumber: string;
}
