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

@Injectable()
export class DoctorsService {
  constructor(@InjectModel(Doctor.name) private doctorModel: Model<Doctor>) {}
  async create(createDoctorDto: CreateDoctorDto) {
    try {
      // Chuyển đổi userId và departmentId sang ObjectId nếu cần
      const { userId, departmentId, licenseNumber, yearsOfExperience } =
        createDoctorDto;
      const doctorData = {
        userId: new Types.ObjectId(userId),
        departmentId: new Types.ObjectId(departmentId),
        licenseNumber,
        yearsOfExperience,
      };
      console.log(doctorData);

      // Tạo bản ghi mới trong cơ sở dữ liệu
      const createdDoctor = await this.doctorModel.create(doctorData);
      return createdDoctor; // Trả về kết quả sau khi tạo thành công
    } catch (error) {
      console.error(error); // In lỗi ra console để kiểm tra
      throw new BadRequestException(
        'Cannot create doctor, please check the data format.',
      );
    }
  }

  // Kiểm tra tính hợp lệ của phân trang
  private validatePagination(current: number, totalPages: number) {
    if (current > totalPages) {
      throw new NotFoundException('Page not found');
    }
  }

  // Tính toán giá trị skip
  private calculateSkip(current: number, pageSize: number): number {
    return (current - 1) * pageSize;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Đảm bảo filter không chứa current hoặc pageSize
    delete filter.current;
    delete filter.pageSize;

    // Đếm tổng số bản ghi
    const totalItems = await this.doctorModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize); // Tính số trang

    // Kiểm tra nếu current lớn hơn totalPages
    this.validatePagination(current, totalPages);

    // Tính toán skip để phân trang
    const skip = this.calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.doctorModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate({
        path: 'userId',
        select: 'fullName',
      }) // Lấy thêm thông tin từ bảng (collection) UserAuth
      .populate({
        path: 'departmentId',
        select: 'departmentName',
      }) // Lấy thêm thông tin từ bảng Department
      .populate({
        path: 'specialtyId',
        select: 'name',
      }) // Lấy thêm thông tin từ bảng Department
      .exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No doctors available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string): Promise<Doctor> {
    try {
      // Tìm kiếm bác sĩ theo id và populate các trường liên quan
      const doctor = await this.doctorModel
        .findById(new Types.ObjectId(_id)) // Chuyển đổi id thành ObjectId
        .populate({
          path: 'userId',
          select: 'fullName phoneNumber',
        }) // Lấy thêm thông tin từ bảng (collection) UserAuth
        .populate({
          path: 'departmentId',
          select: 'departmentName',
        }) // Lấy thêm thông tin từ bảng Department
        .populate({
          path: 'specialtyId',
          select: 'name',
        }) // Lấy thêm thông tin từ bảng Department
        .exec();

      if (!doctor) {
        throw new BadRequestException('Doctor not found');
      }
      return doctor;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to find doctor');
    }
  }

  async update(_id: string, updateDoctorDto: UpdateDoctorDto) {
    // Kiểm tra xem bác sĩ có tồn tại hay không
    const doctor = await this.doctorModel.findById(_id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${_id} not found`);
    }

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
    const doctor = await this.doctorModel.findById(_id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${_id} not found`);
    }

    // Xóa bác sĩ khỏi cơ sở dữ liệu
    await this.doctorModel.findByIdAndDelete(_id);

    return { message: `Doctor with ID ${_id} has been removed successfully` };
  }
}
