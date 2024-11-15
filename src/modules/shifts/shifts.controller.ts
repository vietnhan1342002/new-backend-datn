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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { Public } from '../user-auth/guard/public.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
// @Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Public()
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: string,
    @Param('current') current: string,
    @Param('pageSize') pageSize: string,
  ) {
    return this.shiftsService.findAll(query, +current, +pageSize);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.shiftsService.findOne(_id);
  }

  @Patch(':_id')
  update(@Param('_id') _id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(_id, updateShiftDto);
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.shiftsService.remove(_id);
  }
}
