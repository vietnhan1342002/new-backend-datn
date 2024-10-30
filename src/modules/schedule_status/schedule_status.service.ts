import { Injectable } from '@nestjs/common';
import { CreateScheduleStatusDto } from './dto/create-schedule_status.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule_status.dto';

@Injectable()
export class ScheduleStatusService {
  create(createScheduleStatusDto: CreateScheduleStatusDto) {
    return 'This action adds a new scheduleStatus';
  }

  findAll() {
    return `This action returns all scheduleStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scheduleStatus`;
  }

  update(id: number, updateScheduleStatusDto: UpdateScheduleStatusDto) {
    return `This action updates a #${id} scheduleStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} scheduleStatus`;
  }
}
