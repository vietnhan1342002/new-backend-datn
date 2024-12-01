import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class FilterService {
  constructor(
    @InjectModel(DoctorSchedule.name) private readonly doctorScheduleModel: Model<DoctorSchedule>,
    // @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
  ) {}

  // Filter lịch bác sĩ
  async filterDoctorSchedules(filterCriteria: { doctorId?: string; date?: string; status?: string }) {
    const filter: any = {};
    if (filterCriteria.doctorId) filter.doctorId = filterCriteria.doctorId;
    if (filterCriteria.date) filter.date = filterCriteria.date;
    if (filterCriteria.status) filter.status = filterCriteria.status;

    return this.doctorScheduleModel.find(filter).exec();
  }

  // Lọc lịch bác sĩ với thông tin chi tiết
  async filterDoctorSchedulesWithDetails(filterCriteria: { doctorId?: string; date?: string; status?: string }) {
    const matchFilter: any = {};
    if (filterCriteria.doctorId) matchFilter.doctorId =  new Types.ObjectId(filterCriteria.doctorId);
    if (filterCriteria.date) matchFilter.date = filterCriteria.date;
    if (filterCriteria.status) matchFilter.status = filterCriteria.status;
    
    return this.doctorScheduleModel.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'doctors',           // 
          localField: 'doctorId',   // Trường liên kết trong doctor_schedules
          foreignField: '_id',       // Trường liên kết trong doctors
          as: 'doctorDetails',       // Alias để lưu kết quả
        },
      },
      { $unwind: '$doctorDetails' },
    ]).exec();
  }
}
