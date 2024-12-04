import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { parseQueryParam } from '@/helpers/utils';
import { Types } from 'mongoose';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) { }

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

  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.prescriptionsService.findOne(_id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: Types.ObjectId, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(_id, updatePrescriptionDto);
  }

}
