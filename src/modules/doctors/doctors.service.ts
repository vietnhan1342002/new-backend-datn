import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Model, Types } from 'mongoose';
import { Doctor } from './schemas/doctor.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { UserAuthService } from '../user-auth/user-auth.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private userAuthService: UserAuthService,
  ) { }

  @Cron(CronExpression.EVERY_YEAR)
  async incrementYearsOfExperience() {
    const doctors = await this.doctorModel.find().exec();

    for (const doctor of doctors) {
      doctor.yearsOfExperience += 1;
      await doctor.save();
    }
    console.log('Successfully incremented years of experience for all doctors');
  }

  private async checkDoctorExists(_id: string) {
    const doctor = await this.doctorModel.findById(_id);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${_id} not found`);
    }
    return doctor;
  }

  private async createDoctorData(createDoctorDto: CreateDoctorDto) {

    const { userId, specialtyId, licenseNumber, yearsOfExperience } =
      createDoctorDto;
    return {
      userId: new Types.ObjectId(userId),
      specialtyId: new Types.ObjectId(specialtyId),
      licenseNumber,
      yearsOfExperience,
    };
  }

  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const doctorData = this.createDoctorData(createDoctorDto);
      const createdDoctor = await this.doctorModel.create(doctorData);
      return createdDoctor;
    } catch (error) {
      throw new BadRequestException(
        'Cannot create doctor, please check the data format.',
      );
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query); 
    console.log(query);

    const skip = calculateSkip(current, pageSize);
    const limit = pageSize;

    const doctors = await this.doctorModel.aggregate([
      {
        $lookup: {
          from: 'userauths',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: '$userId',
      },
      {
        $lookup: {
          from: 'specialties',
          localField: 'specialtyId',
          foreignField: '_id',
          as: 'specialtyId',
        },
      },
      {
        $unwind: '$specialtyId',
      },
      {
        $match: {
          $or: [
            { 'userId.fullName': { $regex: query, $options: 'i' } },
            { 'specialtyId.name': { $regex: query, $options: 'i' } },
          ],
        },
      },
      {
        $project: {
          'userId.email': 1,
          licenseNumber: 1,
          yearsOfExperience: 1,
          'userId.fullName': 1,
          'userId.phoneNumber': 1,
          avatar: 1,
          'specialtyId.name': 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const totalItems = await this.doctorModel.aggregate([
      {
        $lookup: {
          from: 'userauths',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: '$userId',
      },
      {
        $lookup: {
          from: 'specialties',
          localField: 'specialtyId',
          foreignField: '_id',
          as: 'specialtyId',
        },
      },
      {
        $unwind: '$specialtyId',
      },
      {
        $match: {
          $or: [
            { 'userId.fullName': { $regex: query, $options: 'i' } },
            { 'specialtyId.name': { $regex: query, $options: 'i' } },
          ],
        },
      },
      {
        $count: 'totalItems',
      },
    ]);

    const totalItemsCount = totalItems.length > 0 ? totalItems[0].totalItems : 0;
    const totalPages = totalItemsCount > 0 ? Math.ceil(totalItemsCount / pageSize) : 0;

    if (doctors.length === 0) {
      throw new NotFoundException('No doctors available');
    }

    return { result: doctors, totalItems: totalItemsCount, totalPages };
  }



  async findOne(_id: string): Promise<Doctor> {
    await this.checkDoctorExists(_id);

    const doctor = await this.populateDoctorQuery(
      this.doctorModel.findById(new Types.ObjectId(_id)),
    ).exec();

    return doctor;
  }

  async update(_id: string, updateDoctorDto: UpdateDoctorDto,
    file?: Express.Multer.File
  ) {
    await this.checkDoctorExists(_id);
    let s3Url: string | undefined;
    if (file) {
      const fileKey = uuid();
      const bucketName = process.env.S3_BUCKET;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype, 
        }),
      );

      s3Url = `${process.env.S3_BASE_URL}/${fileKey}`;
    }

    if (updateDoctorDto.specialtyId) {
      try {
        updateDoctorDto.specialtyId = new Types.ObjectId(updateDoctorDto.specialtyId);
      } catch (error) {
        throw new BadRequestException('Invalid specialtyId format');
      }
    }

    const updatedData = {
      ...updateDoctorDto,
      ...(s3Url && { avatar: s3Url }), 
    };

    const updatedDoctor = await this.doctorModel.findByIdAndUpdate(
      _id,
      { $set: updatedData },
      { new: true },
    );

    return updatedDoctor;
  }

  async remove(_id: string) {
    await this.checkDoctorExists(_id);
    const doctor = await this.doctorModel.findByIdAndDelete(_id);
    await this.userAuthService.remove(doctor.userId.toString())
    return { message: `Doctor with ID ${_id} has been removed successfully` };
  }

  async getDoctorByUserId(userId: string): Promise<Doctor> {
    const objectId = new Types.ObjectId(userId);
    const doctor = await this.doctorModel.findOne({ userId: objectId }).exec();
    if (!doctor) {
      throw new NotFoundException(`Doctor with userId ${userId} not found`);
    }
    return doctor;
  }


  //----------------------------------Helper--------------------------------------//
  private populateDoctorQuery(query: any) {
    return query
      .populate({ path: 'userId', select: 'fullName phoneNumber' })
      .populate({ path: 'specialtyId', select: 'name' });
  }
}
