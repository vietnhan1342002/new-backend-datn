import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { DetailMedicalRecordService } from './detail-medical-record.service';
import { CreateDetailMedicalRecordDto } from './dto/create-detail-medical-record.dto';
import { UpdateDetailMedicalRecordDto } from './dto/update-detail-medical-record.dto';
import { parseQueryParam } from '@/helpers/utils';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('detail-medical-record')
export class DetailMedicalRecordController {
  constructor(private readonly detailMedicalRecordService: DetailMedicalRecordService,
  ) { }


  @Post()
  create(@Body() createDetailMedicalRecordDto: CreateDetailMedicalRecordDto) {
    return this.detailMedicalRecordService.create(createDetailMedicalRecordDto);
  }


  @Get()
  async findAll(
    @Query('query') query: string = '', 
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);
    
    return this.detailMedicalRecordService.findAll(query, currentPage, pageLimit);
  }
  
  @Get('soft-delete')
  async getSoftDelete(
    @Query('query') query: string = '', 
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    
    return this.detailMedicalRecordService.findAllSoftDelete(query, currentPage, pageLimit);
  }

  @Get('/medical-record/:_id')
  findOneByMedicalRecordId(@Param('_id') _id: string) {
    return this.detailMedicalRecordService.findOneByMedicalRecordId(_id);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.detailMedicalRecordService.findOne(_id);
  }

  @Put(':_id')
  update(@Param('_id') _id: string, @Body() updateDetailMedicalRecordDto: UpdateDetailMedicalRecordDto) {
    return this.detailMedicalRecordService.update(_id, updateDetailMedicalRecordDto);
  }


}
