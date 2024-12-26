import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Model, Types } from 'mongoose';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';
import { Specialty } from '../specialties/schemas/specialty.schema';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Medication } from '../medications/schemas/medication.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuth>,
    @InjectModel(Specialty.name) private specialtyModel: Model<Specialty>,
    @InjectModel(Medication.name) private medicationModel: Model<Medication>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
  ) { }


  async searchDoctors(query: string, page: number, pageSize: number) {
    console.log(query);

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
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (doctors.length === 0) {
      throw new NotFoundException('No doctors found matching the query');
    }

    return doctors;
  }

  async searchUsers(query: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

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
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patientDetails',
        },
      },
      { $unwind: '$patientDetails' },

      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorDetails',
        },
      },
      { $unwind: '$doctorDetails' },

      {
        $lookup: {
          from: 'userauths',
          localField: 'doctorDetails.userId',
          foreignField: '_id',
          as: 'doctorUser',
        },
      },
      { $unwind: '$doctorUser' },

      {
        $lookup: {
          from: 'userauths',
          localField: 'patientDetails.userId',
          foreignField: '_id',
          as: 'patientUser',
        },
      },
      { $unwind: '$patientUser' },

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

      { $skip: skip },
      { $limit: limit },

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

  async searchMedication(name: string): Promise<Medication[]> {
    const regex = new RegExp(name, 'i'); 
    return this.medicationModel.find({ name: { $regex: regex } }).exec();
  }

}
