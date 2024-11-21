import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule } from './schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectModel(DoctorSchedule.name)
    private doctorScheduleModel: Model<DoctorSchedule>,
  ) {}

  private async checkDoctorScheduleExistence(
    doctorId: string,
    shiftId: string,
    date: Date,
  ) {
    // Tìm lịch trình có cùng doctorId, shiftId và date
    const scheduleExists = await this.doctorScheduleModel.findOne({
      doctorId,
      shiftId,
      date,
    });

    if (scheduleExists) {
      throw new BadRequestException(
        `Doctor schedule for Doctor ID: ${doctorId}, Shift ID: ${shiftId}, and Date: ${date.toISOString().split('T')[0]} already exists. Please select another date/time!`,
      );
    }
  }

  async create(createDoctorScheduleDto: CreateDoctorScheduleDto) {
    const { doctorId, shiftId, date, status } = createDoctorScheduleDto;

    // Check if the schedule for this doctor on this date already exists
    await this.checkDoctorScheduleExistence(doctorId, shiftId, date);

    const schedule = await this.doctorScheduleModel.create({
      doctorId,
      shiftId,
      date,
      status,
    });
    return { _id: schedule.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.doctorScheduleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * pageSize;

    // Tạo một truy vấn Mongoose và gọi populate trên đó
    const queryResult = this.doctorScheduleModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    // Thực thi truy vấn với populate
    const result = await this.populateDoctorScheduleQuery(queryResult).exec();

    if (result.length === 0)
      throw new NotFoundException('No doctor schedules available');

    return { result, totalPages };
  }

  async findOne(_id: string) {
    const result = await this.populateDoctorScheduleQuery(
      this.doctorScheduleModel
        .findById({ _id })
        .select('doctorId shiftId date status'),
    );
    if (!result) {
      throw new NotFoundException(`Doctor schedule with ID ${_id} not found`);
    }

    return {
      result,
    };
  }

  async update(_id: string, updateDoctorScheduleDto: UpdateDoctorScheduleDto) {
    const schedule = await this.findOne(_id);
    const { doctorId, shiftId, date, status } = updateDoctorScheduleDto;

    // Check if the schedule for this doctor on this date already exists
    await this.checkDoctorScheduleExistence(doctorId, shiftId, date);

    return await this.doctorScheduleModel.updateOne(
      { _id },
      { doctorId, shiftId, date, status },
    );
  }

  async remove(_id: string) {
    const schedule = await this.findOne(_id);
    await this.doctorScheduleModel.deleteOne({ _id });

    return { message: `Doctor schedule with ID ${_id} deleted successfully` };
  }

  //--------------------------/--------------------------------//
  private populateDoctorScheduleQuery(query: any) {
    return query
      .populate({
        path: 'doctorId',
        select: 'userId ',

        populate: {
          path: 'userId',
          select: 'fullName phoneNumber',
        },
      })
      .populate({ path: 'shiftId', select: 'name' });
  }
}
