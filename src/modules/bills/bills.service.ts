import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bill } from './schemas/bill.schema';
import { CreateBillDto } from './dto/create-bill.dto';

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
  async findAll(): Promise<Bill[]> {
    return this.billModel.find().exec();
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
    return bill; // Trả về hóa đơn nếu tìm thấy, nếu không sẽ trả về null
  }

  async updateStatus(id: string): Promise<Bill> {
    return this.billModel.findByIdAndUpdate(
      id,
      { status: 'paid', paymentDate: new Date() },
      { new: true }
    ).exec();
  }
}
