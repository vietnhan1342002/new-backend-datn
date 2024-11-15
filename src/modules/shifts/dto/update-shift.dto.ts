import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsString()
  @IsNotEmpty()
  name: string; // Tên của ca làm việc (Sáng, Chiều, Tối)

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Thời gian bắt đầu ca (ví dụ: "07:00")

  @IsDateString()
  @IsNotEmpty()
  endTime: string; // Thời gian kết thúc ca (ví dụ: "07:30")
}
