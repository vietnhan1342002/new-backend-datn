import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleStatusDto } from './create-schedule_status.dto';

export class UpdateScheduleStatusDto extends PartialType(CreateScheduleStatusDto) {}
