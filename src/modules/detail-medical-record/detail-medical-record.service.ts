import { Injectable, NotFoundException } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import { DetailMedicalRecord } from './schemas/detail-medical-record.schema';
import { CreateDetailMedicalRecordDto } from './dto/create-detail-medical-record.dto';
import { UpdateDetailMedicalRecordDto } from './dto/update-detail-medical-record.dto';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';

@Injectable()
export class DetailMedicalRecordService {
  constructor(
    @InjectModel(DetailMedicalRecord.name)
    private detailMedicalRecordModel: Model<DetailMedicalRecord>,

    private prescriptionsService: PrescriptionsService
  ) { }


  async create(createDetailMedicalRecordDto: CreateDetailMedicalRecordDto) {
    const { medicalRecordId, symptoms, disease, treatmentPlan } = createDetailMedicalRecordDto;

    const detailMedicalRecord = await this.detailMedicalRecordModel.create({
      medicalRecordId: new Types.ObjectId(medicalRecordId), symptoms, disease, treatmentPlan
    });

    return { _id: detailMedicalRecord.id };
  }

  // Tìm một Detail Medical Record theo medicalRecordId
  async findOneByMedicalRecordId(medicalRecordId: Types.ObjectId): Promise<DetailMedicalRecord | null> {
    return await this.detailMedicalRecordModel.findOne({ medicalRecordId });
  }


  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    filter.isDeleted = filter.isDeleted !== undefined ? filter.isDeleted : false;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.detailMedicalRecordModel,
      filter,
      current,
      pageSize,
    );

    const skip = calculateSkip(current, pageSize);

    const result = await this.populateDetailMedicalRecordQuery(
      this.detailMedicalRecordModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    if (result.length === 0) {
      throw new NotFoundException('No detail medical record available');
    }

    return { result, totalItems, totalPages };
  }

  async findAllSoftDelete(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);


    const { totalItems, totalPages } = await preparePaginationFilter(
      this.detailMedicalRecordModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populateDetailMedicalRecordQuery(
      this.detailMedicalRecordModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No medical record is deleted available');
    }

    return { result, totalItems, totalPages };
  }


  async findOne(_id: string) {
    await this.checkDetailMedicalRecordExists(_id);

    const detailMedicalRecord = await this.populateDetailMedicalRecordQuery(
      this.detailMedicalRecordModel.findById(new Types.ObjectId(_id)),
    ).exec();

    return detailMedicalRecord;
  }


  async update(_id: string, updateDetailMedicalRecordDto: UpdateDetailMedicalRecordDto) {
    await this.checkDetailMedicalRecordExists(_id);

    const updatedDetailMedicalRecord = await this.detailMedicalRecordModel.findByIdAndUpdate(
      _id,
      { $set: updateDetailMedicalRecordDto },
      { new: true },
    );

    return updatedDetailMedicalRecord;
  }


  async softDeleteByMedicalRecordId(medicalRecordId: Types.ObjectId, session: any) {

    const detail = await this.detailMedicalRecordModel.findOne({ medicalRecordId }).session(session);

    if (!detail) {
      throw new NotFoundException('No medical records found');
    }

    await this.detailMedicalRecordModel.updateMany(
      { medicalRecordId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );

    await this.prescriptionsService.softDeleteByDetailMedicalRecordId(detail._id, session)
  }

  //------------------------------------------------------//
  // Kiểm tra xem một Detail Medical Record có tồn tại không
  private async checkDetailMedicalRecordExists(_id: string) {
    const detailMedicalRecord = await this.detailMedicalRecordModel.findById(_id);
    if (!detailMedicalRecord) {
      throw new NotFoundException(`Detail medical record with ID ${_id} not found`);
    }
    return detailMedicalRecord;
  }

  // Phương thức này để populate các thông tin cần thiết từ các bảng liên quan
  private populateDetailMedicalRecordQuery(query: any) {
    return query.select('medicalRecordId symptoms disease treatmentPlan');
  }
}
