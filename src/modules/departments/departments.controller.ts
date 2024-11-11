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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Public } from '../user-auth/guard/public.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string,
  ) {
    return this.departmentsService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.departmentsService.findOne(_id);
  }

  @Patch(':_id')
  update(
    @Param('_id') _id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(_id, updateDepartmentDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.departmentsService.remove(_id);
  }
}
