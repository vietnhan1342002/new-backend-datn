import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  // Lấy lịch bác sĩ đơn giản
  @Get('doctor-schedules')
  async getFilteredSchedules(
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.filterService.filterDoctorSchedules({ doctorId, date, status });
  }

  // Lấy lịch bác sĩ với chi tiết thông tin
  @Get('doctor-schedules/details')
  async getFilteredSchedulesWithDetails(
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.filterService.filterDoctorSchedulesWithDetails({ doctorId, date, status });
  }
}
