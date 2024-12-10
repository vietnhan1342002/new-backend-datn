import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { RoleGuard } from '../user-auth/guard/role.guard';
import { JwtAuthGuard } from '../user-auth/guard/jwt-auth.guard';
import { parseQueryParam } from '@/helpers/utils';
import { UpdatePatientUserDto } from './dto/update-patient-user.dto';
import { Permissions } from '@/decorator/permission.decorator';
import { Resource } from '../roles/enum/resource.enum';
import { Action } from '../roles/enum/action.enum';
import { Public } from '../user-auth/guard/public.guard';

// @Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
// @UseGuards(JwtAuthGuard, RoleGuard)
@Public()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Permissions([{ resource: Resource.PATIENT, actions: [Action.READ] }])
  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {

    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    // Tìm tất cả bác sĩ hoặc theo query
    return this.patientsService.findAll(query, currentPage, pageLimit);
  }


  @Permissions([{ resource: Resource.PATIENT, actions: [Action.READ] }])
  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.patientsService.findOne(_id);
  }

  @Permissions([{ resource: Resource.PATIENT, actions: [Action.UPDATE] }])
  @Patch(':_id')
  update(
    @Param('_id') _id: string,
    @Body() updatePatientUserDto: UpdatePatientUserDto,
  ) {
    return this.patientsService.update(
      _id,
      updatePatientUserDto.patient,
      updatePatientUserDto.userAuth,
    );
  }

  @Permissions([{ resource: Resource.ALL, actions: [Action.ALL] }])
  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.patientsService.remove(_id);
  }
}
