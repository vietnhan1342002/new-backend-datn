import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MedicalRecordsService } from './medical_records.service';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { parseQueryParam } from '@/helpers/utils';
import { Public } from '../user-auth/guard/public.guard';
import { Types } from 'mongoose';

@Public()
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) { }

  @Post()
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }


  @Get()
  async findAll(
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.medicalRecordsService.findAll(query, currentPage, pageLimit);
  }
  @Get('soft-delete')
  async getSoftDelete(
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.medicalRecordsService.findAllSoftDelete(query, currentPage, pageLimit);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.medicalRecordsService.findOne(_id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: Types.ObjectId, @Body() updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return this.medicalRecordsService.update(_id, updateMedicalRecordDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: Types.ObjectId) {
    return this.medicalRecordsService.softDeleteMedicalRecord(_id);
  }


}
