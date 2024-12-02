import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Model, Types } from 'mongoose';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';
import { Specialty } from '../specialties/schemas/specialty.schema';
import { Appointment } from '../appointments/schemas/appointment.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuth>,
    @InjectModel(Specialty.name) private specialtyModel: Model<Specialty>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
  ) { }


  async searchDoctors(query: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    const doctors = await this.doctorModel.aggregate([
      {
        $lookup: {
          from: 'userauths',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $lookup: {
          from: 'specialties',
          localField: 'specialtyId',
          foreignField: '_id',
          as: 'specialtyDetails',
        },
      },
      {
        $unwind: '$specialtyDetails',
      },
      {
        $match: {
          $or: [
            { 'userDetails.fullName': { $regex: query, $options: 'i' } },
            { 'specialtyDetails.name': { $regex: query, $options: 'i' } },
          ],
        },
      },
      {
        $project: {
          'userDetails.email': 1,
          licenseNumber: 1,
          yearsOfExperience: 1,
          'userDetails.fullName': 1,
          'specialtyDetails.name': 1,
        },
      },
      {
        $skip: skip, // Bỏ qua số lượng kết quả đầu tiên
      },
      {
        $limit: limit, // Giới hạn số lượng kết quả trả về
      },
    ]);

    if (doctors.length === 0) {
      throw new NotFoundException('No doctors found matching the query');
    }

    return doctors;
  }

  async searchUsers(query: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    console.log(query);

    const users = await this.userAuthModel
      .find({
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
        ],
      })
      .select("-password")
      .skip(skip)
      .limit(pageSize);

    if (users.length === 0) {
      throw new NotFoundException('No users found matching the query');
    }

    return users;
  }

  async searchSpecialties(query: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const specialties = await this.specialtyModel
      .find({
        name: { $regex: query, $options: 'i' },
      })
      .skip(skip)
      .limit(pageSize);

    if (!specialties.length) {
      throw new NotFoundException('No specialties found matching the query');
    }

    return specialties;
  }

  async searchAppointments(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const appointments = await this.appointmentModel.aggregate([
      // Lookup với bảng patients
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patientDetails',
        },
      },
      { $unwind: '$patientDetails' },

      // Lookup với bảng doctors
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorDetails',
        },
      },
      { $unwind: '$doctorDetails' },

      // Lookup user từ doctorId (liên kết thông qua doctor.userId)
      {
        $lookup: {
          from: 'userauths',
          localField: 'doctorDetails.userId', // `userId` trong bảng doctors
          foreignField: '_id',
          as: 'doctorUser',
        },
      },
      { $unwind: '$doctorUser' },

      // Lookup user từ patientId
      {
        $lookup: {
          from: 'userauths',
          localField: 'patientDetails.userId', // `userId` trong bảng patients
          foreignField: '_id',
          as: 'patientUser',
        },
      },
      { $unwind: '$patientUser' },

      // Filter theo fullName hoặc phoneNumber
      {
        $match: {
          $or: [
            { 'doctorUser.fullName': { $regex: query, $options: "i" } },
            { 'doctorUser.phoneNumber': { $regex: query, $options: 'i' } },
            { 'patientUser.fullName': { $regex: query, $options: 'i' } },
            { 'patientUser.phoneNumber': { $regex: query, $options: 'i' } },
          ],
        },
      },

      // Phân trang
      { $skip: skip },
      { $limit: limit },

      // Dự án kết quả trả về
      {
        $project: {
          'patientUser.fullName': 1,
          'patientUser.phoneNumber': 1,
          'doctorUser.fullName': 1,
          'doctorUser.phoneNumber': 1,
          appointmentDate: 1,
          reason: 1,
          status: 1,
        },
      },
    ]);

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException('No appointments found matching the query');
    }

    return appointments;
  }



}
