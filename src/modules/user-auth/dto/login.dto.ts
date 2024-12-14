import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email or PhoneNumber cannot empty' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'password cannot empty' })
  @IsString()
  password: string;
}
