import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { PrescriptionDetailsService } from './prescription-details.service';
import { CreatePrescriptionDetailDto } from './dto/create-prescription-detail.dto';
import { UpdatePrescriptionDetailDto } from './dto/update-prescription-detail.dto';
import { Public } from '../user-auth/guard/public.guard';
import { parseQueryParam } from '@/helpers/utils';
import { Types } from 'mongoose';

@Public()
@Controller('prescription-details')
export class PrescriptionDetailsController {
  constructor(private readonly prescriptionDetailsService: PrescriptionDetailsService) { }

  @UsePipes(new ValidationPipe())
  @Post()
  create(@Body() createPrescriptionDetailDto: CreatePrescriptionDetailDto) {
    return this.prescriptionDetailsService.create(createPrescriptionDetailDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.prescriptionDetailsService.findAll(query, currentPage, pageLimit);
  }

  @Get('soft-delete')
  async findAllSoftDeleted(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.prescriptionDetailsService.findAllSoftDelete(query, currentPage, pageLimit);
  }

  @Get('/prescription/:_id')
  findMedicationsByPrescriptionId(@Param('_id') _id: Types.ObjectId) {
    return this.prescriptionDetailsService.findMedicationsByPrescriptionId(_id);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.prescriptionDetailsService.findOne(_id);
  }

  @UsePipes(new ValidationPipe())
  @Patch(':_id')
  update(@Param('_id') _id: Types.ObjectId, @Body() updatePrescriptionDetailDto: UpdatePrescriptionDetailDto) {
    return this.prescriptionDetailsService.update(_id, updatePrescriptionDetailDto);
  }


}
