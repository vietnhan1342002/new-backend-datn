import { Type } from 'class-transformer';
import { IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId) // Ánh xạ chuỗi thành ObjectId
  patientId: Types.ObjectId; // ID của bệnh nhân

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId) // Ánh xạ chuỗi thành ObjectId
  doctorId: Types.ObjectId; // ID của bác sĩ

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId) // Ánh xạ chuỗi thành ObjectId
  doctorScheduleId: Types.ObjectId; // ID của lịch làm việc bác sĩ


  @IsOptional()
  reason?: string;
}
