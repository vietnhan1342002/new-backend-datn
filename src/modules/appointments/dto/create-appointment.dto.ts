import { Type } from 'class-transformer';
import { IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsMongoId()
  patientId: Types.ObjectId | string;
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId) 
  doctorId: Types.ObjectId; 

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId) 
  doctorScheduleId: Types.ObjectId; 


  @IsOptional()
  reason?: string;
}
