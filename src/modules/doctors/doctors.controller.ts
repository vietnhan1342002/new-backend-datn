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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { Public } from '../user-auth/guard/public.guard';
import { parseQueryParam } from '@/helpers/utils';
import { Types } from 'mongoose';
import { Doctor } from './schemas/doctor.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RoleGuard)
@Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() createDoctorDto: CreateDoctorDto,
  ) {

    return this.doctorsService.create(createDoctorDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.doctorsService.findAll(query, currentPage, pageLimit);
  }

  @Public()
  @Get('user/:userId')
  async getDoctorByUserId(@Param('userId') userId: string): Promise<Doctor> {
    return this.doctorsService.getDoctorByUserId(userId);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.doctorsService.findOne(_id);
  }

  @Permissions([{ resource: Resource.DOCTOR, actions: [Action.UPDATE] }])
  @Patch(':_id')
  @UseInterceptors(FileInterceptor('avatar'))
  update(@Param('_id') _id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log(file);
    return this.doctorsService.update(_id, updateDoctorDto,
      file
    );
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.doctorsService.remove(_id);
  }
}
