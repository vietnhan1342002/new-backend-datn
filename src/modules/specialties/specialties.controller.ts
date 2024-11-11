import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Public } from '../user-auth/guard/public.guard';
import { Specialty } from './schemas/specialty.schema';

@Public()
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
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
    return this.specialtiesService.findAll(query, currentPage, pageLimit);
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
