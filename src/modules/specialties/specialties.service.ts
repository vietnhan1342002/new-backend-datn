// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreateSpecialtyDto } from './dto/create-specialty.dto';
// import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
// import { InjectModel } from '@nestjs/mongoose';
// import { Specialty } from './schemas/specialty.schema';
// import { Model, Types } from 'mongoose';
// import {
//   calculateSkip,
//   isExistHelper,
//   preparePaginationFilter,
//   validatePagination,
// } from '@/helpers/utils';
// import aqp from 'api-query-params';

// @Injectable()
// export class SpecialtiesService {
//   constructor(
//     @InjectModel(Specialty.name)
//     private specialtyModel: Model<Specialty>,
//   ) {}

//   async create(createSpecialtyDto: CreateSpecialtyDto) {
//     const { name, description } = createSpecialtyDto;

//     const specialtyExists = await isExistHelper({ name }, this.specialtyModel);

//     if (specialtyExists) {
//       throw new BadRequestException(
//         `Specialty : ${name} already exists. Please enter another name!`,
//       );
//     }

//     const specialty = await this.specialtyModel.create({
//       name,
//       description,
//     });
//     return { _id: specialty.id };
//   }

//   async findAll(query: string, current: number, pageSize: number) {
//     const { filter, sort } = aqp(query);

//     const { totalItems, totalPages } = await preparePaginationFilter(
//       this.specialtyModel,
//       filter,
//       current,
//       pageSize,
//     );

//     // Tính toán skip để phân trang
//     const skip = calculateSkip(current, pageSize);

//     // Truy vấn các bản ghi với phân trang và sắp xếp
//     const result = await this.specialtyModel
//       .find(filter)
//       .limit(pageSize)
//       .skip(skip)
//       .sort(sort as any)
//       .exec();

//     // Nếu không có dữ liệu, ném ngoại lệ
//     if (result.length === 0) {
//       throw new NotFoundException('No specialties available');
//     }

//     return { result, totalItems, totalPages };
//   }

//   async findOne(_id: string): Promise<Specialty> {
//     // Tìm kiếm bác sĩ theo id và populate các trường liên quan
//     const specialty = await this.specialtyModel
//       .findById(new Types.ObjectId(_id)) // Chuyển đổi id thành ObjectId
//       .exec();

//     if (!specialty) {
//       throw new BadRequestException('Specialty not found');
//     }
//     return specialty;
//   }

//   async update(_id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
//     // Kiểm tra xem bác sĩ có tồn tại hay không
//     const specialty = await this.findOne(_id);
//     if (!specialty) {
//       throw new NotFoundException(`Specialty with ID ${_id} not found`);
//     }

//     // Cập nhật thông tin bác sĩ
//     const updatedSpecialty = await this.specialtyModel.findByIdAndUpdate(
//       _id,
//       { $set: updateSpecialtyDto },
//       { new: true }, // Trả về bản ghi đã cập nhật
//     );

//     return updatedSpecialty;
//   }

//   async remove(_id: string) {
//     // Kiểm tra xem bác sĩ có tồn tại hay không
//     const specialty = await this.findOne(_id); // Tái sử dụng phương thức findOne
//     if (!specialty) {
//       throw new NotFoundException(`Specialty with ID ${_id} not found`);
//     }

//     await this.specialtyModel.findByIdAndDelete(_id);

//     return {
//       message: `Specialty with ID ${_id} has been removed successfully`,
//     };
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Specialty } from './schemas/specialty.schema';
import { Model } from 'mongoose';
import {
  isExistHelper,
  preparePaginationFilter,
  calculateSkip,
} from '@/helpers/utils';
import aqp from 'api-query-params';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectModel(Specialty.name)
    private specialtyModel: Model<Specialty>,
  ) {}

  private async checkSpecialtyExistence(name: string) {
    const specialtyExists = await isExistHelper({ name }, this.specialtyModel);
    if (specialtyExists) {
      throw new BadRequestException(
        `Specialty: ${name} already exists. Please enter another name!`,
      );
    }
  }

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const { name, description } = createSpecialtyDto;

    // Kiểm tra nếu specialty đã tồn tại
    await this.checkSpecialtyExistence(name);

    // Tạo specialty mới
    const specialty = await this.specialtyModel.create({
      name,
      description,
    });
    return { _id: specialty.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.specialtyModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip và phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn dữ liệu với phân trang và sắp xếp
    const result = await this.specialtyModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

    if (result.length === 0) {
      throw new NotFoundException('No specialties available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string): Promise<Specialty> {
    const specialty = await this.specialtyModel.findById(_id).exec();

    if (!specialty) {
      throw new BadRequestException('Specialty not found');
    }
    return specialty;
  }

  async update(_id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
    // Kiểm tra và cập nhật specialty
    const specialty = await this.findOne(_id);

    await this.checkSpecialtyExistence(updateSpecialtyDto.name);
    const updatedSpecialty = await this.specialtyModel.findByIdAndUpdate(
      _id,
      { $set: updateSpecialtyDto },
      { new: true }, // Trả về bản ghi đã cập nhật
    );

    return updatedSpecialty;
  }

  async remove(_id: string) {
    const specialty = await this.findOne(_id);
    await this.specialtyModel.findByIdAndDelete(_id);

    return {
      message: `Specialty with ID ${_id} has been removed successfully`,
    };
  }
}
