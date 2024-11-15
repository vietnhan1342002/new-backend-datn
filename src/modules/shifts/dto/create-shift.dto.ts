import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  startTime: string; // Thời gian bắt đầu ca (ví dụ: "07:00")

  @IsNotEmpty()
  endTime: string; // Thời gian kết thúc ca (ví dụ: "07:30")
}
