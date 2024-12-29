import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bill } from './schemas/bill.schema';
import { CreateBillDto } from './dto/create-bill.dto';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import aqp from 'api-query-params';
import * as moment from 'moment';

@Injectable()
export class BillsService {
  constructor(@InjectModel(Bill.name) private billModel: Model<Bill>) { }

  async checkBillExists(prescriptionId: string): Promise<boolean> {
    const existingBill = await this.billModel.findOne({ prescriptionId }).exec();
    return !!existingBill;
  }

  async create(createBillDto: CreateBillDto) {
    const isBillExists = await this.checkBillExists(createBillDto.prescriptionId);
    if (isBillExists) {
      throw new Error('Bill with this prescriptionId already exists');
    }
    const newBill = new this.billModel(createBillDto);
    return await newBill.save();
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.billModel,
      filter,
      current,
      pageSize,
    );

    const skip = calculateSkip(current, pageSize);

    const result = await this.billModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

    if (result.length === 0) {
      throw new NotFoundException('No bills available');
    }

    return { result, totalItems, totalPages };
  }



  async sumPaidBillsByDate(date?: string): Promise<number> {
    try {
      // Nếu không có ngày truyền vào, sử dụng ngày hiện tại
      const targetDate = date ? moment(date) : moment();

      // Lấy thời gian bắt đầu và kết thúc trong ngày đã chọn
      const startOfDay = targetDate.startOf('day').toDate();
      const endOfDay = targetDate.endOf('day').toDate();

      const result = await this.billModel.aggregate([
        {
          $match: {
            status: 'paid',
            paymentDate: { $gte: startOfDay, $lt: endOfDay } // Lọc theo khoảng thời gian của ngày đã chọn
          }
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: '$totalPrice' } // Tính tổng giá trị của các hóa đơn
          }
        }
      ]);

      return result.length > 0 ? result[0].totalSum : 0;
    } catch (error) {
      console.error('Error calculating sum of paid bills:', error);
      throw new Error('Unable to calculate total sum for paid bills');
    }
  }


  async sumPaidBillsLastMonth(): Promise<number> {
    try {
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month').toDate();
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month').toDate();

      const result = await this.billModel.aggregate([
        {
          $match: {
            status: 'paid',
            paymentDate: { $gte: startOfLastMonth, $lt: endOfLastMonth },
          }
        },
        {
          $group: {
            _id: null,
            totalSum: { $sum: '$totalPrice' }
          }
        }
      ]);

      return result.length > 0 ? result[0].totalSum : 0;
    } catch (error) {
      console.error('Error calculating sum of paid bills for last month:', error);
      throw new Error('Unable to calculate total sum for paid bills in the previous month');
    }
  }


  async findOne(id: string): Promise<Bill> {
    return this.billModel.findById(id).exec();
  }

  async update(id: string, updateBillDto: CreateBillDto): Promise<Bill> {
    return this.billModel.findByIdAndUpdate(id, updateBillDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Bill> {
    return this.billModel.findByIdAndDelete(id).exec();
  }

  async findByPrescriptionId(prescriptionId: string): Promise<Bill | null> {
    const bill = await this.billModel.findOne({ prescriptionId }).exec();
    return bill;
  }

  async updateStatus(id: string): Promise<Bill> {
    return this.billModel.findByIdAndUpdate(
      id,
      { status: 'paid', paymentDate: new Date() },
      { new: true }
    ).exec();
  }
}
