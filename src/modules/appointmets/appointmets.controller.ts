import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AppointmetsService } from './appointmets.service';
import { CreateAppointmetDto } from './dto/create-appointmet.dto';
import { UpdateAppointmetDto } from './dto/update-appointmet.dto';

@Controller('appointmets')
export class AppointmetsController {
  constructor(private readonly appointmetsService: AppointmetsService) {}

  @Post()
  create(@Body() createAppointmetDto: CreateAppointmetDto) {
    return this.appointmetsService.create(createAppointmetDto);
  }

  @Get()
  findAll() {
    return this.appointmetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmetDto: UpdateAppointmetDto) {
    return this.appointmetsService.update(+id, updateAppointmetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmetsService.remove(+id);
  }
}
