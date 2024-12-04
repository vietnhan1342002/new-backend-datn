import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Prescription } from './schemas/prescription.schema';
import mongoose, { Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
// import { DetailMedicalRecordService } from '../detail-medical-record/detail-medical-record.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<Prescription>,

    // private detailMedicalRecordService: DetailMedicalRecordService
  ) { }

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    const { detailMedicalRecordId, medicationId, quantityPrescribed } = createPrescriptionDto;

    const prescription = await this.prescriptionModel.create({
      detailMedicalRecordId: new Types.ObjectId(detailMedicalRecordId),
      medicationId: new Types.ObjectId(medicationId),
      quantityPrescribed
    });

    return { _id: prescription.id };
  }

  // Tìm một Prescription dựa trên detail_medical_record_id
  async findByDetailMedicalRecordId(detail_medical_record_id: Types.ObjectId) {
    return await this.prescriptionModel.find({ detail_medical_record_id });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Thêm điều kiện để chỉ lấy các bản ghi chưa bị xóa (isDeleted: false)
    filter.isDeleted = filter.isDeleted !== undefined ? filter.isDeleted : false;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.prescriptionModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populatePrescriptionQuery(
      this.prescriptionModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No prescriptions available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: Types.ObjectId) {
    await this.checkPrescriptionExists(_id);

    const prescription = await this.populatePrescriptionQuery(
      this.prescriptionModel.findById(new Types.ObjectId(_id)),
    ).exec();

    if (prescription.isDeleted === true) {
      throw new NotFoundException('No prescription available');
    }

    return prescription;
  }

  async update(_id: Types.ObjectId, updatePrescriptionDto: UpdatePrescriptionDto) {
    await this.checkPrescriptionExists(_id);

    const updatedPrescription = await this.prescriptionModel.findByIdAndUpdate(
      _id,
      { $set: updatePrescriptionDto },
      { new: true },
    );

    return updatedPrescription;
  }

  async softDeleteByDetailMedicalRecordId(detailMedicalRecordId: Types.ObjectId, session: any) {
    if (!detailMedicalRecordId) {
      return;
    }

    await this.prescriptionModel.updateMany(
      { detailMedicalRecordId: { $in: detailMedicalRecordId } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { session }
    );
  }

  async findAllSoftDelete(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Thêm điều kiện để chỉ lấy các bản ghi chưa bị xóa (isDeleted: false)
    filter.isDeleted = filter.isDeleted !== true;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.prescriptionModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populatePrescriptionQuery(
      this.prescriptionModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No prescriptions found');
    }

    return { result, totalItems, totalPages };
  }

  //------------------------------------------------------//
  private async checkPrescriptionExists(_id: Types.ObjectId) {
    const prescription = await this.prescriptionModel.findById(_id);
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${_id} not found`);
    }
    return prescription;
  }

  private populatePrescriptionQuery(query: any) {
    return query
      .populate([
        {
          path: 'medication_id',
          select: 'name dosage',
        },

      ]);
  }

  async checkIfPrescriptionIsDeleted(_id: Types.ObjectId): Promise<void> {
    const objectId = new Types.ObjectId(_id);
    const prescription = await this.prescriptionModel.findById(objectId);
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.isDeleted) {
      throw new BadRequestException('This prescription has already been soft deleted');
    }
  }
}
