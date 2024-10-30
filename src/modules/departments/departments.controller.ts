import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string
  ) {
    return this.departmentsService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(+id);
  }
}
