import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Specialty } from './schemas/specialty.schema';
import { Model, Types } from 'mongoose';
import {
  isExistHelper,
  preparePaginationFilter,
  calculateSkip,
} from '@/helpers/utils';
import aqp from 'api-query-params';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectModel(Specialty.name)
    private specialtyModel: Model<Specialty>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) { }

  private async checkSpecialtyExistence(name: string) {
    const specialtyExists = await isExistHelper({ name }, this.specialtyModel);
    if (specialtyExists) {
      throw new BadRequestException(
        `Specialty: ${name} already exists. Please enter another name!`,
      );
    }
  }

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const { name, departmentId, description } = createSpecialtyDto;

    // Kiểm tra nếu specialty đã tồn tại
    await this.checkSpecialtyExistence(name);

    // Tạo specialty mới
    const specialty = await this.specialtyModel.create({
      name,
      departmentId: new Types.ObjectId(departmentId),
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
      .populate({ path: 'departmentId', select: 'departmentName' })
      .exec();

    if (result.length === 0) {
      throw new NotFoundException('No specialties available');
    }

    return { result, totalItems, totalPages };
  }

  async findAllName(): Promise<string[]> {
    const specialties = await this.specialtyModel.find().select('-_id name').exec();
    return specialties.map(specialty => specialty.name);
  }

  async findByName(name: string) {
    const specialty = await this.specialtyModel.findOne({ name }).exec();
    return specialty._id.toString()
  }

  async findOne(_id: string): Promise<Specialty> {
    const specialty = await this.specialtyModel
      .findById(_id)
      .populate({ path: 'departmentId', select: 'departmentName' })
      .exec();

    if (!specialty) {
      throw new BadRequestException('Specialty not found');
    }
    return specialty;
  }

  async update(_id: string, updateSpecialtyDto: UpdateSpecialtyDto, file?: Express.Multer.File) {
    let s3Url: string | undefined;
    if (file) {
      const fileKey = uuid();
      const bucketName = process.env.S3_BUCKET;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype, // Lấy đúng định dạng file
        }),
      );

      s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;
    }

    const updatedData = {
      ...updateSpecialtyDto,
      ...(s3Url && { icon: s3Url }), // Chỉ thêm avatar nếu có file
    };

    const updatedSpecialty = await this.specialtyModel.findByIdAndUpdate(
      _id,
      { $set: updatedData },
      { upsert: false, new: true }, // Trả về bản ghi đã cập nhật
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


  async createMany(specialtiesData: any[]) {
    return this.specialtyModel.insertMany(specialtiesData);
  }

}
