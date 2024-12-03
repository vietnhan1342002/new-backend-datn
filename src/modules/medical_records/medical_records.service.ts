import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { MedicalRecord } from './schemas/medical_record.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecord>,
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

  async softDeleteMedicalRecord(_id) {
    const updatedMedicalRecord = await this.medicalRecordModel.findByIdAndUpdate(
      _id,
      {
        $set: {
          isDeleted: true,         // Đánh dấu bản ghi là đã bị xóa
          deletedAt: new Date(),   // Lưu thời gian xóa (tuỳ chọn)
        }
      },
      { new: true }  // Trả về bản ghi đã được cập nhật
    );
    return updatedMedicalRecord;
  };



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

}
