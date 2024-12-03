import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsNotEmpty, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { Status } from '../schemas/appointment.schema';

export class UpdateStatusAppointmentDto {
    @IsEnum(Status)
    status?: Status;
}
