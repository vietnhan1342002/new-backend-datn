import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { Bill } from './schemas/bill.schema';
import { Public } from '../user-auth/guard/public.guard';
import { parseQueryParam } from '@/helpers/utils';

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
  async findAll(
    @Query('query') query: string = '',
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
  ) {
    const currentPage = parseQueryParam(current);
    const pageLimit = parseQueryParam(pageSize);

    return this.billsService.findAll(query, currentPage, pageLimit);
  }

  @Get('sum-paid-bills')
  async getSumPaidBillsToday(@Query('date') date?: string): Promise<{ totalPaidAmountToday: number }> {
    const totalPaidAmountToday = await this.billsService.sumPaidBillsByDate(date);
    return { totalPaidAmountToday };
  }

  @Get('last-month')
  async getSumPaidBillsLastMonth(): Promise<{ totalPaidAmountLastMonth: number }> {
    const totalPaidAmountLastMonth = await this.billsService.sumPaidBillsLastMonth();
    return { totalPaidAmountLastMonth };
  }


  @Get('/prescriptionId/:id')
  findByPrescriptionId(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findByPrescriptionId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findOne(id);
  }

  @Patch('/status/:id')
  updateStatus(@Param('id') id: string): Promise<Bill> {
    return this.billsService.updateStatus(id);
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
