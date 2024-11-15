import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'currentPassword cannot empty' })
  @IsString()
  @MinLength(6) // Đảm bảo mật khẩu ít nhất 6 ký tự
  currentPassword: string;

  @IsNotEmpty({ message: 'newPassword cannot empty' })
  @IsString()
  @MinLength(6) // Đảm bảo mật khẩu ít nhất 6 ký tự
  newPassword: string;
}
