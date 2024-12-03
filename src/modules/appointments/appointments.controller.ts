import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { parseQueryParam } from '@/helpers/utils';
import { Status } from './schemas/appointment.schema';
import { UpdateStatusAppointmentDto } from './dto/update-status.dto';
import { Public } from '../user-auth/guard/public.guard';

// @UseGuards(JwtAuthGuard, RoleGuard)
// @Permissions([{ resource: Resource.APPOINTMENT, actions: [Action.ALL] }])

@Public()
@Controller('appointments')
@Permissions([{ resource: Resource.APPOINTMENT, actions: [Action.ALL] }])
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);
    return this.appointmentsService.findAll(query, currentPage, pageLimit);
  }

  @Permissions([
    { resource: Resource.APPOINTMENT, actions: [Action.ALL, Action.READ] }, // Patient có quyền 'read'
  ])
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.appointmentsService.findOne(_id);
  }

  @Patch(':_id')
  update(
    @Param('_id') _id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(_id, updateAppointmentDto);
  }

  @Patch('/status/:_id')
  updateStatus(
    @Param('_id') _id: string,
    @Body() status: UpdateStatusAppointmentDto,
  ) {
    return this.appointmentsService.updateStatus(_id, status);
  }

  @Permissions([
    { resource: Resource.APPOINTMENT, actions: [Action.ALL, Action.DELETE] }, // Receptionist có quyền 'all'
  ])
  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.appointmentsService.remove(_id);
  }
}
