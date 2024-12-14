import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Status } from '../schemas/appointment.schema';
import { Types } from 'mongoose';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'patientId cannot be empty or null' })
  patientId: Types.ObjectId | string;

  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'doctorId cannot be empty or null' })
  doctorId: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'doctorScheduleId cannot be empty or null' })
  doctorScheduleId: Types.ObjectId;

  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
