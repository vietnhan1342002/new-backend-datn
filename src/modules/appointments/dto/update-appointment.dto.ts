import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Status } from '../schemas/appointment.schema';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'patientId cannot be empty or null' })
  patientId: string;

  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'doctorId cannot be empty or null' })
  doctorId: string;

  @IsOptional()
  @IsMongoId()
  @IsNotEmpty({ message: 'doctorScheduleId cannot be empty or null' })
  doctorScheduleId: string;

  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
