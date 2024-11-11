import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Specialty } from './schemas/specialty.schema';
import { Model, Types } from 'mongoose';
import { isExistHelper } from '@/helpers/utils';
import aqp from 'api-query-params';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectModel(Specialty.name)
    private specialtyModel: Model<Specialty>,
  ) {}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const { name, description } = createSpecialtyDto;

    const specialtyExists = await isExistHelper({ name }, this.specialtyModel);

    if (specialtyExists) {
      throw new BadRequestException(
        `Specialty : ${name} already exists. Please enter another name!`,
      );
    }

    const specialty = await this.specialtyModel.create({
      name,
      description,
    });
    return { _id: specialty.id };
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
    const totalItems = await this.specialtyModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize); // Tính số trang

    // Kiểm tra nếu current lớn hơn totalPages
    this.validatePagination(current, totalPages);

    // Tính toán skip để phân trang
    const skip = this.calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.specialtyModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No specialties available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string): Promise<Specialty> {
    try {
      // Tìm kiếm bác sĩ theo id và populate các trường liên quan
      const specialty = await this.specialtyModel
        .findById(new Types.ObjectId(_id)) // Chuyển đổi id thành ObjectId
        .exec();

      if (!specialty) {
        throw new BadRequestException('Specialty not found');
      }
      return specialty;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to find specialty');
    }
  }

  async update(_id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
    // Kiểm tra xem bác sĩ có tồn tại hay không
    const specialty = await this.specialtyModel.findById(_id);
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${_id} not found`);
    }

    // Cập nhật thông tin bác sĩ
    const updatedSpecialty = await this.specialtyModel.findByIdAndUpdate(
      _id,
      { $set: updateSpecialtyDto },
      { new: true }, // Trả về bản ghi đã cập nhật
    );

    return updatedSpecialty;
  }

  async remove(_id: string) {
    // Kiểm tra xem bác sĩ có tồn tại hay không
    const specialty = await this.specialtyModel.findById(_id);
    if (!specialty) {
      throw new NotFoundException(`Specialty with ID ${_id} not found`);
    }

    // Xóa bác sĩ khỏi cơ sở dữ liệu
    await this.specialtyModel.findByIdAndDelete(_id);

    return {
      message: `Specialty with ID ${_id} has been removed successfully`,
    };
  }
}
