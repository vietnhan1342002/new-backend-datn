import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsString()
  @IsNotEmpty()
  name: string; 

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
