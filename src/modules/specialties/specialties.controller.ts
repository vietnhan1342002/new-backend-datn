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
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Public } from '../user-auth/guard/public.guard';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { RoleGuard } from '../user-auth/guard/role.guard';

import { parseQueryParam } from '@/helpers/utils';
import { Roles } from '@/decorator/role.decorator';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('admin')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
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
    return this.specialtiesService.findAll(query, currentPage, pageLimit);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.specialtiesService.findOne(_id);
  }

  @Patch(':_id')
  update(
    @Param('_id') _id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(_id, updateSpecialtyDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.specialtiesService.remove(_id);
  }
}
