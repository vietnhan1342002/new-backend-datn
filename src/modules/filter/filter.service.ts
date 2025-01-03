import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DoctorSchedule, Status } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Model, Types } from 'mongoose';
import { Specialty } from '../specialties/schemas/specialty.schema';
import { Doctor } from '../doctors/schemas/doctor.schema';
import { MedicalRecord } from '../medical_records/schemas/medical_record.schema';
import { MedicalRecordsService } from '../medical_records/medical_records.service';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';
import { of } from 'rxjs';

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
    // Áp dụng các điều kiện filter dựa trên đầu vào
    if (filterCriteria.doctorId) filter.doctorId = new Types.ObjectId(filterCriteria.doctorId);
    if (filterCriteria.shiftId) filter.shiftId = new Types.ObjectId(filterCriteria.shiftId);
    if (filterCriteria.status) filter.status = filterCriteria.status;
    if (filterCriteria.date) {
      filter.date = new Date(filterCriteria.date);
    }

    // Truy vấn dữ liệu
    const doctor_schedules = await this.doctorScheduleModel
      .find(filter) // Áp dụng filter đã xây dựng
      .populate({
        path: 'shiftId',
        select: 'name',
      })
      .exec();

    // Kiểm tra nếu không tìm thấy lịch phù hợp
    if (doctor_schedules.length === 0) {
      throw new NotFoundException("Don't have any schedule suitable");
    }

    return doctor_schedules;
  }

  async filterDoctorSchedulesBySpecialty(filterCriteria: { specialtyId?: string; date?: string; status?: string; shift?: string }) {
    const matchFilter: any = {};
    console.log("filterCriteria", filterCriteria);

    if (filterCriteria.date) matchFilter.date = new Date(filterCriteria.date);
    if (filterCriteria.status) matchFilter.status = filterCriteria.status
    const doctor_schedules = await this.doctorScheduleModel.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorDetails',
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
        $project: {
          _id: 1,
          doctorId: 1,
          shiftId: 1,
          date: 1,
          status: 1,
          shift: '$shiftDetails.name',
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
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorDetails',
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

    if (filterCriteria.patientId) {
      filter.patientId = new Types.ObjectId(filterCriteria.patientId);
    }

    const medicalRecords = await this.medicalRecordModel
      .find(filter)
      .populate({
        path: 'patientId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'fullName',
        },
      })
      .populate({
        path: 'doctorId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'fullName',
        },
      })
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate',
      })
      .exec();

    return medicalRecords;
  }

  async countDoctors(): Promise<number> {
    const count = await this.doctorModel.countDocuments();
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
    const filter = { status: 'confirmed' };

    if (doctorId) {
      filter['doctorId'] = new Types.ObjectId(doctorId);
    }

    return this.appointmentModel.find(filter).sort({ createdAt: -1 }).exec();
  }

}
