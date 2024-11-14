import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Model, Types } from 'mongoose';
import { Doctor } from './schemas/doctor.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';

@Injectable()
export class DoctorsService {
  constructor(@InjectModel(Doctor.name) private doctorModel: Model<Doctor>) {}

  private async checkDoctorExists(_id: string) {
    const doctor = await this.doctorModel.findById(_id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${_id} not found`);
    }
    return doctor;
  }

  // Tạo dữ liệu bác sĩ với ObjectId
  private createDoctorData(createDoctorDto: CreateDoctorDto) {
    const { userId, specialtyId, licenseNumber, yearsOfExperience } =
      createDoctorDto;
    return {
      userId: new Types.ObjectId(userId),
      specialtyId: new Types.ObjectId(specialtyId),
      licenseNumber,
      yearsOfExperience,
    };
  }
  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const doctorData = this.createDoctorData(createDoctorDto);
      const createdDoctor = await this.doctorModel.create(doctorData);
      return createdDoctor;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Cannot create doctor, please check the data format.',
      );
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.doctorModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.populateDoctorQuery(
      this.doctorModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any),
    ).exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No doctors available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string): Promise<Doctor> {
    await this.checkDoctorExists(_id);

    const doctor = await this.populateDoctorQuery(
      this.doctorModel.findById(new Types.ObjectId(_id)),
    ).exec();

    return doctor;
  }

  async update(_id: string, updateDoctorDto: UpdateDoctorDto) {
    // Kiểm tra xem bác sĩ có tồn tại hay không
    await this.checkDoctorExists(_id);

    // Cập nhật thông tin bác sĩ
    const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
      _id,
      { $set: updateDoctorDto },
      { new: true }, // Trả về bản ghi đã cập nhật
    );

    return updatedDoctor;
  }

  async remove(_id: string) {
    // Kiểm tra xem bác sĩ có tồn tại hay không
    const doctor = await this.findOne(_id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${_id} not found`);
    }

    // Xóa bác sĩ khỏi cơ sở dữ liệu
    await this.doctorModel.findByIdAndDelete(_id);

    return { message: `Doctor with ID ${_id} has been removed successfully` };
  }

  //----------------------------------Helper--------------------------------------//
  private populateDoctorQuery(query: any) {
    return query
      .populate({ path: 'userId', select: 'fullName phoneNumber' })
      .populate({ path: 'specialtyId', select: 'name' });
  }
}
