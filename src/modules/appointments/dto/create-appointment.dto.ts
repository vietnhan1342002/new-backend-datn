import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsDate,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsMongoId()
  patientId: string; // ID của bệnh nhân

  @IsNotEmpty()
  @IsMongoId()
  doctorId: string; // ID của bác sĩ

  @IsNotEmpty()
  @IsMongoId()
  doctorScheduleId: string; // ID của lịch làm việc bác sĩ

  @IsOptional()
  reason?: string;
}
