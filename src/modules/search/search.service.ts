import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
  ) { }


  async searchDoctors(query: string) {
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
    ]);

    if (doctors.length === 0) {
      throw new NotFoundException('No doctors found matching the query');
    }

    return doctors;
  }


}
