import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Status } from '../schemas/doctor-schedule.schema';

export class CreateDoctorScheduleDto {
  @IsNotEmpty({ message: 'doctorId cannot be empty' })
  @IsMongoId({ message: 'doctorId invalid' })
  doctorId: string;

  @IsNotEmpty({ message: 'shiftId cannot be empty' })
  @IsMongoId({ message: 'shiftId invalid' })
  shiftId: string;

  @IsNotEmpty({ message: 'date cannot be empty' })
  @Type(() => Date) // Chuyển đổi kiểu từ string thành Date
  date: Date; // Ngày của lịch trình, kiểu Date

  @IsNotEmpty({ message: 'status cannot be empty' })
  @IsEnum(Status, {
    message: 'status must be active or inactive',
  })
  status: Status;
}
