import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule, Status } from './schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import { preparePaginationFilter } from '@/helpers/utils';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectModel(DoctorSchedule.name)
    private doctorScheduleModel: Model<DoctorSchedule>,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('Cron job started');

    await this.updateExpiredStatus();
  }

  private async checkDoctorScheduleExistence(
    doctorId: Types.ObjectId,
    shiftId: Types.ObjectId,
    date: Date,
  ) {
    const scheduleExists = await this.doctorScheduleModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      shiftId: new Types.ObjectId(shiftId),
      date,
    });

    if (scheduleExists) {
      throw new BadRequestException(
        `Shift in Date: ${date.toISOString().split('T')[0]} already exists. Please select another date/time!`
      );
    }
  }

  async create(createDoctorScheduleDto: CreateDoctorScheduleDto) {
    const { doctorId, shiftId, date, status } = createDoctorScheduleDto;

    await this.checkDoctorScheduleExistence(doctorId, shiftId, date);

    const schedule = await this.doctorScheduleModel.create({
      doctorId: new Types.ObjectId(doctorId),
      shiftId: new Types.ObjectId(shiftId),
      date,
      status,
    });

    return { _id: schedule.id };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    filter.status = { $ne: Status.EXPIRED };

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.doctorScheduleModel,
      filter,
      current,
      pageSize,
    );

    const skip = (current - 1) * pageSize;

    const queryResult = this.doctorScheduleModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);


    const result = await this.populateDoctorScheduleQuery(queryResult).exec();

    if (result.length === 0)
      throw new NotFoundException('No doctor schedules available');

    return { result, totalItems, totalPages };
  }

  async findOne(_id: Types.ObjectId) {
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

  async update(_id: Types.ObjectId, updateDoctorScheduleDto: UpdateDoctorScheduleDto) {
    const schedule = await this.findOne(_id);
    const { doctorId, shiftId, date, status } = updateDoctorScheduleDto;

    await this.checkDoctorScheduleExistence(doctorId, shiftId, date);

    return await this.doctorScheduleModel.updateOne(
      { _id },
      { doctorId, shiftId, date, status },
    );
  }

  async updateExpiredStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("today", today);
    const expiredSchedules = await this.doctorScheduleModel.updateMany(
      {
        date: { $lt: today },
        status: { $ne: Status.EXPIRED },
      },
      {
        $set: { status: Status.EXPIRED },
      },
    );

    return {
      message: `${expiredSchedules.modifiedCount} doctor schedules have been marked as EXPIRED.`,
    };
  }


  async remove(_id: Types.ObjectId) {
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
