import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorScheduleDto } from './create-doctor-schedule.dto';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../schemas/doctor-schedule.schema';

export class UpdateDoctorScheduleDto extends PartialType(
  CreateDoctorScheduleDto,
) {
  @IsOptional()
  @IsMongoId({ message: 'doctorId invalid' })
  doctorId?: string;

  @IsOptional()
  @IsMongoId({ message: 'shiftId invalid' })
  shiftId?: string;

  @IsOptional()
  @Type(() => Date) // Chuyển đổi kiểu từ string thành Date
  date?: Date; // Ngày của lịch trình, kiểu Date
  @IsOptional()
  @IsEnum(Status, {
    message: 'status must be active or inactive',
  })
  status: Status;
}
