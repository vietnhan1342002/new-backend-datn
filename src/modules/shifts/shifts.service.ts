import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Shift } from './schemas/shift.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { paginateAndPopulate } from '@/helpers/utils';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name)
    private shiftModel: Model<Shift>,
  ) {}

  private async checkShiftExistence(startTime: string, endTime: string) {
    const shiftExists = await this.shiftModel.findOne({
      startTime,
      endTime,
    });
    if (shiftExists) {
      throw new BadRequestException(
        `Shift from ${startTime} to ${endTime} already exists. Please choose different times.`,
      );
    }
  }

  async create(createShiftDto: CreateShiftDto) {
    const { startTime, endTime } = createShiftDto;

    // Kiểm tra ca làm việc có tồn tại không
    await this.checkShiftExistence(startTime, endTime);

    const shift = await this.shiftModel.create({
      name: `${startTime} - ${endTime}`,
      startTime,
      endTime,
    });

    return { _id: shift.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { result, totalPages, totalItems } = await paginateAndPopulate(
      this.shiftModel,
      {
        filter,
        sort,
        current,
        pageSize,
        populateQuery: undefined,
      },
    );

    if (result.length === 0) throw new NotFoundException('No shifts available');

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string) {
    const result = await this.shiftModel
      .findById({ _id })
      .select('name startTime endTime');
    if (!result) {
      throw new NotFoundException(`Shift with ID ${_id} not found`);
    }
    return result;
  }

  async update(_id: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.findOne(_id);
    const { name, startTime, endTime } = updateShiftDto;

    // Kiểm tra xem ca làm việc mới có trùng không
    await this.checkShiftExistence(startTime, endTime);

    return await this.shiftModel.updateOne(
      { _id },
      { name, startTime, endTime },
    );
  }

  async remove(_id: string) {
    const shift = await this.findOne(_id);
    await this.shiftModel.deleteOne({ _id });

    return { message: `Shift with ID ${_id} deleted successfully` };
  }
}
