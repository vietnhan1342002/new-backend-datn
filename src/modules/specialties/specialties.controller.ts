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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { Public } from '../user-auth/guard/public.guard';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { parseQueryParam } from '@/helpers/utils';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RoleGuard)
@Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) { }

  // @Post('create-many')
  // async createMany(@Body() specialtiesData: any[]) {
  //   console.log(specialtiesData);
  //   return this.specialtiesService.createMany(specialtiesData);
  // }

  @Post()
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('query') query: string = '', 
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.specialtiesService.findAll(query, currentPage, pageLimit);
  }

  @Public()
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.specialtiesService.findOne(_id);
  }

  @Public()
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
