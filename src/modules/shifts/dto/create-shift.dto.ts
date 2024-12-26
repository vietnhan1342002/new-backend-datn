import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  startTime: string; 

  @IsNotEmpty()
  endTime: string;
}
