import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppointmentStatusService } from './appointment_status.service';
import { CreateAppointmentStatusDto } from './dto/create-appointment_status.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment_status.dto';

@Controller('appointment-status')
export class AppointmentStatusController {
  constructor(private readonly appointmentStatusService: AppointmentStatusService) {}

  @Post()
  create(@Body() createAppointmentStatusDto: CreateAppointmentStatusDto) {
    return this.appointmentStatusService.create(createAppointmentStatusDto);
  }

  @Get()
  findAll() {
    return this.appointmentStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentStatusDto: UpdateAppointmentStatusDto) {
    return this.appointmentStatusService.update(+id, updateAppointmentStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentStatusService.remove(+id);
  }
}
