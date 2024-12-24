import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';
import { Specialty } from '../specialties/schemas/specialty.schema';
import { Doctor } from '../doctors/schemas/doctor.schema';
import { MedicalRecord } from '../medical_records/schemas/medical_record.schema';
import { MedicalRecordsService } from '../medical_records/medical_records.service';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';

@Injectable()
export class FilterService {
  constructor(
    @InjectModel(DoctorSchedule.name) private readonly doctorScheduleModel: Model<DoctorSchedule>,
    @InjectModel(Doctor.name) private readonly doctorModel: Model<Doctor>,
    @InjectModel(Specialty.name) private readonly specialtyModel: Model<Specialty>,
    @InjectModel(MedicalRecord.name) private readonly medicalRecordModel: Model<MedicalRecord>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<Appointment>,

    private readonly medicalRecordsService: MedicalRecordsService
  ) { }


  async filterDoctorSchedules(filterCriteria: { doctorId?: string; date?: string; status?: string; shiftId?: string }) {
    const filter: any = {};

    // Lọc theo doctorId, shiftId, và status (nếu có)
    if (filterCriteria.doctorId) filter.doctorId = new Types.ObjectId(filterCriteria.doctorId);
    if (filterCriteria.shiftId) filter.shiftId = new Types.ObjectId(filterCriteria.shiftId);
    if (filterCriteria.status) filter.status = filterCriteria.status;

    // Lọc theo ngày (nếu có)
    if (!filterCriteria.date) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      filter.date = { $gte: date };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(filter);


    const doctor_schedules = await this.doctorScheduleModel
      .find({ ...filter, date: { $gte: today } })
      .populate({
        path: 'shiftId',
        select: 'name',
      })
      .exec();

    if (doctor_schedules.length === 0) {
      throw new NotFoundException("Don't have any schedule suitable");
    }

    return doctor_schedules;
  }

  async filterDoctorSchedulesBySpecialty(filterCriteria: { specialtyId?: string; date?: string; status?: string; shift?: string }) {
    const matchFilter: any = {};
    if (filterCriteria.date) matchFilter.date = new Date(filterCriteria.date); // Chuyển đổi `date` thành đối tượng `Date`
    if (filterCriteria.status) matchFilter.status = filterCriteria.status;
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
    return await this.specialtyModel.find(filter).exec();
  }

  async fieldDoctorBySpecialtyId(filterCriteria: { specialtyId?: string }): Promise<Doctor[]> {
    const filter: any = {};
    if (filterCriteria.specialtyId) filter.specialtyId = new Types.ObjectId(filterCriteria.specialtyId);

    const doctors = await this.doctorModel.find({ specialtyId: filter.specialtyId }).populate({
      path: 'userId',
      select: 'fullName'
    }).exec();
    if (doctors.length === 0) {
      throw new NotFoundException("Don't have any schedule suitable");
    }
    return doctors
  }

  async fieldMMedicalRecordsByPatientId(filterCriteria: { patientId?: string }): Promise<MedicalRecord[]> {
    const filter: any = {};

    // Nếu có patientId thì thêm vào filter
    if (filterCriteria.patientId) {
      filter.patientId = new Types.ObjectId(filterCriteria.patientId);
    }

    const medicalRecords = await this.medicalRecordModel
      .find(filter)
      .populate({
        path: 'patientId',
        select: 'userId', // Chỉ lấy trường userId từ patientId
        populate: {
          path: 'userId', // Lấy thông tin userId (ví dụ fullName)
          select: 'fullName',
        },
      })
      .populate({
        path: 'doctorId', // Tên trường trong MedicalRecord
        select: 'userId', // Chỉ lấy trường userId từ doctorId
        populate: {
          path: 'userId', // Lấy thông tin userId (ví dụ fullName)
          select: 'fullName',
        },
      })
      .populate({
        path: 'appointmentId', // Tên trường trong MedicalRecord
        select: 'appointmentDate',
      })
      .exec();

    return medicalRecords;
  }

  async countDoctors(): Promise<number> {
    const count = await this.doctorModel.countDocuments();  // Đếm tất cả tài liệu trong collection
    return count;
  }

  async countAppointments(doctorId?: string): Promise<number> {
    let count;
    if (doctorId) {
      count = await this.appointmentModel.find({ status: 'confirmed', doctorId: new Types.ObjectId(doctorId) }).countDocuments()
    } else {
      count = await this.appointmentModel.find({ status: 'confirmed' }).countDocuments()
    }
    return count
  }

  async filterAppointmentConfirmed(doctorId?: string): Promise<Appointment[]> {
    if (doctorId) {
      return this.appointmentModel.find({ doctorId: new Types.ObjectId(doctorId), status: 'confirmed' }).exec();
    } else {
      return this.appointmentModel.find({ status: 'confirmed' }).exec();
    }
  }

}
