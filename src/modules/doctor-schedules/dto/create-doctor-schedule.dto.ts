import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Status } from '../schemas/doctor-schedule.schema';
import { Types } from 'mongoose';

export class CreateDoctorScheduleDto {
  @IsNotEmpty({ message: 'doctorId cannot be empty' })
  @IsMongoId({ message: 'doctorId invalid' })
  doctorId: Types.ObjectId;

  @IsNotEmpty({ message: 'shiftId cannot be empty' })
  @IsMongoId({ message: 'shiftId invalid' })
  shiftId: Types.ObjectId;

  @IsNotEmpty({ message: 'date cannot be empty' })
  @Type(() => Date) 
  date: Date; 

  @IsOptional()
  @IsEnum(Status, {
    message: 'status must be active or inactive',
  })
  status?: Status;
}
