import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor } from '@/modules/doctors/schemas/doctor.schema';
import { Model, Types } from 'mongoose';
import { UserAuth } from '../user-auth/schemas/user-auth.schema';
import { Specialty } from '../specialties/schemas/specialty.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuth>,
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

  async searchUsers(query: string) {
    const users = await this.userAuthModel.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } }, // Tìm theo fullName
        { phoneNumber: { $regex: query, $options: 'i' } }, // Tìm theo phone
      ],
    });

    // Kiểm tra nếu không tìm thấy người dùng
    if (users.length === 0) {
      throw new NotFoundException('No users found matching the query');
    }

    return users;
  }
}
