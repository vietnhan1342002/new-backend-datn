import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  async findAll() {
    // Tìm tất cả bác sĩ hoặc theo query
    return this.rolesService.findAll();
  }

  @Get(':_id')
  findRoleById(@Param('_id') _id: string) {
    return this.rolesService.findRoleById(_id);
  }
}
