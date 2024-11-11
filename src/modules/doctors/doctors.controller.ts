import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';

@UseGuards(JwtAuthGuard, RoleGuard)
@Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  async findAll(
    @Query('query') query: string = '', // Sử dụng giá trị mặc định là chuỗi rỗng nếu không có query
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = this.parseQueryParam(current);
    const pageLimit = this.parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.doctorsService.findAll(query, currentPage, pageLimit);
  }

  // Hàm phụ trợ để kiểm tra và phân tích các tham số
  private parseQueryParam(value: string): number {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue) || parsedValue < 1) {
      throw new BadRequestException('Invalid parameter');
    }
    return parsedValue;
  }

  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.doctorsService.findOne(_id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(_id, updateDoctorDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.doctorsService.remove(_id);
  }
}
