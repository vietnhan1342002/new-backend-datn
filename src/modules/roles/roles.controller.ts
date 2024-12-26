import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Public } from '../user-auth/guard/public.guard';
import { Types } from 'mongoose';

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
    return this.rolesService.findAll();
  }

  @Get(':_id')
  findRoleById(@Param('_id') _id: Types.ObjectId) {
    return this.rolesService.findRoleById(_id);
  }
}
