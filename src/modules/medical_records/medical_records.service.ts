import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { MedicalRecord } from './schemas/medical_record.schema';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import { DetailMedicalRecordService } from '../detail-medical-record/detail-medical-record.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecord>,

    private detailMedicalRecordService: DetailMedicalRecordService
  ) { }

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const { appointmentId, doctorId, patientId, diagnosis, note } = createMedicalRecordDto;

    const medical_record = await this.medicalRecordModel.create({
      appointmentId, doctorId, patientId, diagnosis, note
    });
    return { _id: medical_record.id };
  }

  // Tìm một Medical Record dựa trên appointmentId
  async findOneByAppointmentId(appointmentId: Types.ObjectId): Promise<MedicalRecord | null> {
    return await this.medicalRecordModel.findOne({ appointmentId });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Thêm điều kiện để chỉ lấy các bản ghi chưa bị xóa (isDeleted: false)
    filter.isDeleted = filter.isDeleted !== undefined ? filter.isDeleted : false;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.medicalRecordModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populateMedicalRecordQuery(
      this.medicalRecordModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No medical record available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string) {
    await this.checkMedicalRecordExists(_id);

    const medical_record = await this.populateMedicalRecordQuery(
      this.medicalRecordModel.findById(new Types.ObjectId(_id)),
    ).exec();
    if (medical_record.isDeleted === true) {
      throw new NotFoundException('No medical record available');
    }
    return medical_record;
  }

  async update(_id: string, updateMedicalRecordDto: UpdateMedicalRecordDto) {

    await this.checkMedicalRecordExists(_id);

    const updatedMedicalRecord = await this.medicalRecordModel.findByIdAndUpdate(
      _id,
      { $set: updateMedicalRecordDto },
      { new: true },
    );

    return updatedMedicalRecord;
  }

  async softDeleteMedicalRecord(_id: string) {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.checkIfMedicalRecordIsDeleted(_id);

      const objectId = new Types.ObjectId(_id);

      const medicalRecord = await this.medicalRecordModel.findById(objectId).session(session);
      if (!medicalRecord) {
        throw new NotFoundException('Medical record not found');
      }

      medicalRecord.isDeleted = true;
      medicalRecord.deletedAt = new Date();
      await medicalRecord.save({ session });

      await this.detailMedicalRecordService.softDeleteByMedicalRecordId(_id, session);


      await session.commitTransaction();
      return { message: 'Medical record soft deleted successfully' };
    } catch (error) {

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


  async findAllSoftDelete(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Thêm điều kiện để chỉ lấy các bản ghi chưa bị xóa (isDeleted: false)
    filter.isDeleted = filter.isDeleted !== true;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.medicalRecordModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populateMedicalRecordQuery(
      this.medicalRecordModel
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

  //------------------------------------------------------//
  private async checkMedicalRecordExists(_id: string) {
    const medical_record = await this.medicalRecordModel.findById(_id);
    if (!medical_record) {
      throw new NotFoundException(`medical_record with ID ${_id} not found`);
    }
    return medical_record;
  }

  private populateMedicalRecordQuery(query: any) {
    return query
      .populate([
        {
          path: 'doctorId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'fullName',
          },
        },
        {
          path: 'patientId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'fullName',
          },
        },
        {
          path: 'appointmentId',
          select: 'appointmentDate',
        },
      ]);
  }
  async checkIfMedicalRecordIsDeleted(_id: string): Promise<void> {
    const objectId = new Types.ObjectId(_id);

    const medicalRecord = await this.medicalRecordModel.findById(objectId);

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    if (medicalRecord.isDeleted) {
      throw new BadRequestException('This medical record has already been soft deleted');
    }
  }

}
