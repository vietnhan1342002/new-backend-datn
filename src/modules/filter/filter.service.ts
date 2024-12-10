import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';
import { Specialty } from '../specialties/schemas/specialty.schema';
import { loadavg } from 'os';

@Injectable()
export class FilterService {
  constructor(
    @InjectModel(DoctorSchedule.name) private readonly doctorScheduleModel: Model<DoctorSchedule>,
    @InjectModel(Specialty.name) private readonly specialtyModel: Model<Specialty>,
  ) { }


  async filterDoctorSchedules(filterCriteria: { doctorId?: string; date?: string; status?: string }) {
    const filter: any = {};
    if (filterCriteria.doctorId) filter.doctorId = new Types.ObjectId(filterCriteria.doctorId);
    if (filterCriteria.date) filter.date = filterCriteria.date;
    if (filterCriteria.status) filter.status = filterCriteria.status;

    const doctor_schedules = await this.doctorScheduleModel.find(filter).exec();
    if (doctor_schedules.length === 0) {
      throw new NotFoundException("Don't have any schedule suitable")
    }
    return doctor_schedules
  }

  async filterDoctorSchedulesBySpecialty(filterCriteria: { specialtyId?: string; date?: string; status?: string; shift?: string }) {
    const matchFilter: any = {};
    if (filterCriteria.date) matchFilter.date = new Date(filterCriteria.date); // Chuyển đổi `date` thành đối tượng `Date`
    if (filterCriteria.status) matchFilter.status = filterCriteria.status;
    console.log("shift in filter: ", filterCriteria.shift);

    const doctor_schedules = await this.doctorScheduleModel.aggregate([
      { $match: matchFilter }, // Lọc dữ liệu cơ bản
      {
        $lookup: {
          from: 'doctors',              // Tên collection "doctors"
          localField: 'doctorId',       // Trường liên kết trong collection "doctor_schedules"
          foreignField: '_id',          // Trường liên kết trong collection "doctors"
          as: 'doctorDetails',          // Kết quả lưu trong trường `doctorDetails`
        },
      },
      { $unwind: { path: '$doctorDetails', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...(filterCriteria.specialtyId && {
            'doctorDetails.specialtyId': new Types.ObjectId(filterCriteria.specialtyId),
          }),
        },
      },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shiftDetails',
        },
      },
      { $unwind: { path: '$shiftDetails', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...(filterCriteria.shift && { 'shiftDetails.name': filterCriteria.shift }),
        },
      },
      {
        $project: {                 // Chỉ giữ lại các trường mong muốn
          _id: 1,
          doctorId: 1,
          shiftId: 1,
          date: 1,
          shift: '$shiftDetails.name', // Thêm trường `shift`
        },
      },
    ]).exec();

    return doctor_schedules;
  }


  // Lọc lịch bác sĩ với thông tin chi tiết
  async filterDoctorSchedulesWithDetails(filterCriteria: { doctorId?: string; date?: string; status?: string }) {
    const matchFilter: any = {};
    if (filterCriteria.doctorId) matchFilter.doctorId = new Types.ObjectId(filterCriteria.doctorId);
    if (filterCriteria.date) matchFilter.date = filterCriteria.date;
    if (filterCriteria.status) matchFilter.status = filterCriteria.status;

    const doctor_schedules = await this.doctorScheduleModel.aggregate([
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

    if (doctor_schedules.length === 0) {
      throw new NotFoundException("Don't have any schedule suitable")
    }
    return doctor_schedules
  }

  async filterSpecialties(filterCriteria: { departmentId?: string }) {
    const filter: any = {};
    if (filterCriteria.departmentId) filter.departmentId = new Types.ObjectId(filterCriteria.departmentId);
    return this.specialtyModel.find(filter).exec();
  }
}
