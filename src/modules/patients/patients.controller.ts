import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { Roles } from '@/decorator/role.decorator';
import { parseQueryParam } from '@/helpers/utils';
import { UpdatePatientUserDto } from './dto/update-patient-user.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('patient')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Roles('admin', 'doctor')
  @Get()
  async findAll(
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.patientsService.findAll(query, currentPage, pageLimit);
  }

  @Roles('doctor')
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.patientsService.findOne(_id);
  }

  @Patch(':_id')
  update(
    @Param('_id') _id: string,
    @Body() updatePatientUserDto: UpdatePatientUserDto,
  ) {
    return this.patientsService.update(
      _id,
      updatePatientUserDto.patient,
      updatePatientUserDto.userAuth,
    );
  }

  @Roles('admin')
  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.patientsService.remove(_id);
  }
}
