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

import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Public } from '../user-auth/guard/public.guard';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { Types } from 'mongoose';

// @UseGuards(JwtAuthGuard, RoleGuard)
// @Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Public()
@Controller('doctorSchedules')
export class DoctorSchedulesController {
  constructor(
    private readonly doctorSchedulesService: DoctorSchedulesService,
  ) { }

  @Post()
  create(@Body() createDoctorScheduleDto: CreateDoctorScheduleDto) {
    return this.doctorSchedulesService.create(createDoctorScheduleDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string,
  ) {
    return this.doctorSchedulesService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.doctorSchedulesService.findOne(_id);
  }

  @Patch(':_id')
  update(
    @Param('_id') _id: Types.ObjectId,
    @Body() updateDoctorScheduleDto: UpdateDoctorScheduleDto,
  ) {
    return this.doctorSchedulesService.update(_id, updateDoctorScheduleDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: Types.ObjectId) {
    return this.doctorSchedulesService.remove(_id);
  }
}
