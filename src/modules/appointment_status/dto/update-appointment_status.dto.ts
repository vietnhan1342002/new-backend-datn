import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentStatusDto } from './create-appointment_status.dto';

export class UpdateAppointmentStatusDto extends PartialType(CreateAppointmentStatusDto) {}
