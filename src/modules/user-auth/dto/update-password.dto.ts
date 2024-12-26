import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'currentPassword cannot empty' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsNotEmpty({ message: 'newPassword cannot empty' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
