import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { Public } from '../user-auth/guard/public.guard';
import { Appointment } from '../appointments/schemas/appointment.schema';

@Public()
@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) { }


  @Get('specialties/doctors')
  async fieldDoctorBySpecialtyId(
    @Query('specialtyId') specialtyId?: string
  ) {
    return this.filterService.fieldDoctorBySpecialtyId({ specialtyId });
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

  // Lấy lịch bác sĩ đơn giản
  @Get('doctor-schedules')
  async getFilteredSchedules(
    @Query('doctorId') doctorId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.filterService.filterDoctorSchedules({ doctorId, date, status, shiftId });
  }

  @Get('doctor-schedules-specialty')
  async getFilteredSchedulesBySpecialty(
    @Query('specialtyId') specialtyId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('shift') shift?: string,
  ) {
    return this.filterService.filterDoctorSchedulesBySpecialty({ specialtyId, date, status, shift });
  }



  // Lấy lịch bác sĩ đơn giản
  @Get('specialties')
  async getFilteredSpecialties(
    @Query('departmentId') departmentId?: string,
  ) {
    return this.filterService.filterSpecialties({ departmentId });
  }

  @Get('medical_records')
  async getfieldMMedicalRecordsByPatientId(
    @Query('patientId') patientId?: string,
  ) {
    return this.filterService.fieldMMedicalRecordsByPatientId({ patientId });
  }

  @Get('appointment-confirmed')
  async getConfirmedAppointments(): Promise<Appointment[]> {
    return this.filterService.filterAppointmentConfirmed();
  }

  @Get('count/doctors')
  async getDoctorsCount(): Promise<number> {
    return this.filterService.countDoctors();
  }
  @Get('count/appointments')
  async getAppointmentsCount(): Promise<number> {
    return this.filterService.countAppointments();
  }


}
