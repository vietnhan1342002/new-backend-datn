import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduleStatusService } from './schedule_status.service';
import { CreateScheduleStatusDto } from './dto/create-schedule_status.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule_status.dto';

@Controller('schedule-status')
export class ScheduleStatusController {
  constructor(private readonly scheduleStatusService: ScheduleStatusService) {}

  @Post()
  create(@Body() createScheduleStatusDto: CreateScheduleStatusDto) {
    return this.scheduleStatusService.create(createScheduleStatusDto);
  }

  @Get()
  findAll() {
    return this.scheduleStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleStatusDto: UpdateScheduleStatusDto) {
    return this.scheduleStatusService.update(+id, updateScheduleStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleStatusService.remove(+id);
  }
}
