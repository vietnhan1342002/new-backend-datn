import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmetDto } from './create-appointmet.dto';

export class UpdateAppointmetDto extends PartialType(CreateAppointmetDto) {}
