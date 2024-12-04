import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { calculateSkip, isExistHelper, preparePaginationFilter } from '@/helpers/utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Medication } from './schemas/medication.schema';
import aqp from 'api-query-params';

@Injectable()
export class MedicationsService {
  constructor(@InjectModel(Medication.name)
  private medicationModel: Model<Medication>,) { }


  async create(createMedicationDto: CreateMedicationDto) {
    const { name } = createMedicationDto;

    const medicationExists = await isExistHelper(
      { name },
      this.medicationModel,
    );
    if (medicationExists) {
      throw new BadRequestException(
        `Medication: ${name} already exists. Please enter another name!`,
      );
    }

    const medication = await this.medicationModel.create(
      createMedicationDto
    )

    return { _id: medication.id };;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Lấy tổng số bản ghi và số trang
    const { totalItems, totalPages } = await preparePaginationFilter(
      this.medicationModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.medicationModel
      .find(filter)
      .select('-_id -__v -createdAt -updatedAt')
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No medications found');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: Types.ObjectId) {

    const prescription = await this.medicationModel.findById(new Types.ObjectId(_id))
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${_id} not found`);
    }
    return prescription;
  }

  update(_id: Types.ObjectId, updateMedicationDto: UpdateMedicationDto) {
    return
  }

  remove(_id: Types.ObjectId) {
    return
  }

  //------------------------------------------------------------------------
}
