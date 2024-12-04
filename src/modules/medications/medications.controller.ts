import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, BadRequestException } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Public } from '../user-auth/guard/public.guard';
import { parseQueryParam } from '@/helpers/utils';
import { Types } from 'mongoose';
import { UpdateQuantityMedicationDto } from './dto/update-quantity-medication.dto';

@Public()
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) { }

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationsService.create(createMedicationDto);
  }

  @Get()
  findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);
    return this.medicationsService.findAll(query, currentPage, pageLimit);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: Types.ObjectId) {
    return this.medicationsService.findOne(_id);
  }

  @Patch('/updateQuantity/:_id')
  updateQuantity(@Param('_id') _id: Types.ObjectId, @Body() updateQuantityMedicationDto: UpdateQuantityMedicationDto) {
    const { quantity } = updateQuantityMedicationDto; 
    if (isNaN(quantity)) {
      throw new BadRequestException('Invalid medication quantity');
    }

    return this.medicationsService.updateMedicationQuantity(_id, quantity);

  }

  @Patch(':_id')
  update(@Param('_id') _id: Types.ObjectId, @Body() updateMedicationDto: UpdateMedicationDto) {
    return this.medicationsService.update(_id, updateMedicationDto);
  }


  @Delete(':_id')
  remove(@Param('_id') _id: Types.ObjectId) {
    return this.medicationsService.remove(_id);
  }
}
