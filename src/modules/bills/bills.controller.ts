import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { Bill } from './schemas/bill.schema';
import { Public } from '../user-auth/guard/public.guard';

@Public()
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) { }

  @Post()
  create(@Body() createBillDto: CreateBillDto): Promise<Bill> {
    if (!createBillDto.paymentDate) {
      createBillDto.paymentDate = new Date();
    }
    return this.billsService.create(createBillDto);
  }

  @Get()
  findAll(): Promise<Bill[]> {
    return this.billsService.findAll();
  }
  @Get('/prescriptionId/:id')
  findByPrescriptionId(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findByPrescriptionId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: CreateBillDto): Promise<Bill> {
    return this.billsService.update(id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Bill> {
    return this.billsService.remove(id);
  }
}
