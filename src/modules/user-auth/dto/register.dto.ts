import {
    IsNotEmpty,
    IsOptional,

} from 'class-validator';
import { Types } from 'mongoose';

export class RegisterDto {
    @IsNotEmpty({ message: 'fullName cannot be empty' })
    fullName: string;

    @IsNotEmpty({ message: 'email cannot be empty' })
    email: string;

    @IsNotEmpty({ message: 'phoneNumber cannot be empty' })
    phoneNumber: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    password: string;

    @IsOptional()
    roleId: Types.ObjectId;
}
