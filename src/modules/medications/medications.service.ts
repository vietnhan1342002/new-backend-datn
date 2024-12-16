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

    await this.checkNameExists(name);

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
      .select('-__v -createdAt -updatedAt')
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
    const medication = await this.medicationModel.findById(new Types.ObjectId(_id))
    // .select('-__v -createdAt -updatedAt')

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${_id} not found`);
    }
    return medication;
  }

  async update(_id: Types.ObjectId, updateMedicationDto: UpdateMedicationDto) {
    // Lấy thông tin thuốc hiện tại từ database
    const currentMedication = await this.medicationModel.findById(_id);

    // Nếu tên thuốc có thay đổi, kiểm tra xem tên mới có bị trùng không
    if (updateMedicationDto.name && updateMedicationDto.name !== currentMedication.name) {
      await this.checkNameExists(updateMedicationDto.name);
    }

    // Tạo đối tượng để lưu các trường dữ liệu cần cập nhật
    const updateFields = {};

    // So sánh từng trường và chỉ đưa vào những trường thay đổi
    for (const key in updateMedicationDto) {
      if (updateMedicationDto[key] !== currentMedication[key]) {
        updateFields[key] = updateMedicationDto[key];
      }
    }

    // Nếu không có trường nào thay đổi, không thực hiện update
    if (Object.keys(updateFields).length === 0) {
      return { message: 'No changes detected' };
    }

    // Cập nhật thuốc với chỉ các trường đã thay đổi
    const updatedMedication = await this.medicationModel.findByIdAndUpdate(
      _id,
      updateFields,
      { new: true, runValidators: true }
    );

    return { _id: updatedMedication.id };
  }



  async updateMedicationQuantity(
    medicationId: Types.ObjectId,
    quantity: number,
  ) {
    const medication = await this.findOne(medicationId);
    if (!medication) {
      throw new Error('Medication not found');
    }

    // Kiểm tra nếu số lượng không đủ
    if (quantity > medication.quantity) {
      throw new BadRequestException('Not enough medication in stock');
    }

    const remainingQuantity = medication.quantity - quantity;

    let warningMessage = '';
    if (remainingQuantity <= medication.minQuantity) {
      warningMessage = `Warning: The amount of medicine has reached the minimum level (${medication.minQuantity}).`
    }

    await this.medicationModel.findByIdAndUpdate(medicationId,
      { quantity: remainingQuantity },
      { new: true }
    )

    return {
      status: 'success',
      warningMessage,
      quantity: remainingQuantity,
    };
  }

  async addMedicationQuantity(
    medicationId: Types.ObjectId,
    quantity: number,
  ) {

    const medication = await this.findOne(medicationId);
    if (!medication) {
      throw new Error('Medication not found');
    }

    const newQuantity = medication.quantity + quantity;


    let warningMessage = '';

    await this.medicationModel.findByIdAndUpdate(medicationId,
      { quantity: newQuantity },
      { new: true }
    )

    return {
      status: 'success',
      warningMessage,
      quantity: newQuantity,
    };
  }

  async remove(_id: Types.ObjectId) {
    try {
      const deletedItem = await this.medicationModel.findByIdAndDelete(_id);

      if (!deletedItem) {
        throw new BadRequestException('Item not found');
      }

      return {
        message: 'Item successfully deleted',
        data: deletedItem,
      };
    } catch (error) {
      // Xử lý lỗi (tùy chỉnh theo yêu cầu)
      throw new BadRequestException(`Failed to delete item: ${error.message}`);
    }
  }


  //------------------------------------------------------------------------//

  async checkNameExists(name: string) {
    const medicationExists = await isExistHelper(
      { name },
      this.medicationModel,
    );
    if (medicationExists) {
      throw new BadRequestException(
        `Medication: ${name} already exists. Please enter another name!`,
      );
    }
  }
}
