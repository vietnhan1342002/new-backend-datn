import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { parseQueryParam } from '@/helpers/utils';
import { Types } from 'mongoose';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) { }

  @UsePipes(new ValidationPipe())
  @Post()
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.prescriptionsService.findAll(query, currentPage, pageLimit);
  }

  @Get('soft-delete')
  async findAllSoftDeleted(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.prescriptionsService.findAllSoftDelete(query, currentPage, pageLimit);
  }

  @Get('/detail-medical-record/:_id')
  findByDetailMedicalRecordId(@Param('_id') _id: Types.ObjectId) {
    return this.prescriptionsService.findByDetailMedicalRecordId(_id);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.prescriptionsService.findOne(_id);
  }


  @UsePipes(new ValidationPipe())
  @Patch(':_id')
  update(@Param('_id') _id: Types.ObjectId, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(_id, updatePrescriptionDto);
  }

}
