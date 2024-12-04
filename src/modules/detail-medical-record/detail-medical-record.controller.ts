import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);
    console.log(1);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.detailMedicalRecordService.findAll(query, currentPage, pageLimit);
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
    return this.detailMedicalRecordService.findAllSoftDelete(query, currentPage, pageLimit);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.detailMedicalRecordService.findOne(_id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: string, @Body() updateDetailMedicalRecordDto: UpdateDetailMedicalRecordDto) {
    return this.detailMedicalRecordService.update(_id, updateDetailMedicalRecordDto);
  }


}
