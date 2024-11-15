import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Patient } from './schemas/patient.schema';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import aqp from 'api-query-params';
import { UserAuthService } from '../user-auth/user-auth.service';
import { UpdateUserAuthDto } from '../user-auth/dto/update-user-auth.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private userAuthService: UserAuthService,
  ) {}
  // create date patient with ObjectId
  private createPatientData(createPatientDto: CreatePatientDto) {
    const { userId, address, dateOfBirth, gender } = createPatientDto;
    return {
      userId: new Types.ObjectId(userId),
      address,
      dateOfBirth,
      gender,
    };
  }

  async create(createPatientDto: CreatePatientDto) {
    try {
      const patientData = this.createPatientData(createPatientDto);
      const createdPatient = await this.patientModel.create(patientData);
      return createdPatient;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'Cannot create doctor, please check the data format.',
      );
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.patientModel,
      filter,
      current,
      pageSize,
    );

    // Tính toán skip để phân trang
    const skip = calculateSkip(current, pageSize);

    // Truy vấn các bản ghi với phân trang và sắp xếp
    const result = await this.patientModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate({ path: 'userId', select: 'fullName phoneNumber' });

    // Nếu không có dữ liệu, ném ngoại lệ
    if (result.length === 0) {
      throw new NotFoundException('No doctors available');
    }

    return { result, totalItems, totalPages };
  }

  async findOne(_id: string): Promise<Patient> {
    await this.checkPatientExists(_id);

    const patient = await await this.populatePatientQuery(
      this.patientModel.findById(new Types.ObjectId(_id)),
    ).exec();

    return patient;
  }

  async update(
    _id: string,
    updatePatientDto: UpdatePatientDto,
    updateUserDto: UpdateUserAuthDto,
  ) {
    await this.checkPatientExists(_id);
    // Cập nhật thông tin Patient
    const updatedPatient = await this.patientModel.findByIdAndUpdate(
      _id,
      { $set: updatePatientDto },
      { new: true }, // Trả về bản ghi đã cập nhật
    );

    if (updatedPatient?.userId) {
      await this.userAuthService.update(updatedPatient.userId.toString(), {
        phoneNumber: updateUserDto.phoneNumber,
        fullName: updateUserDto.fullName,
      });
    }

    return updatedPatient;
  }

  async remove(_id: string) {
    await this.checkPatientExists(_id);
    await this.patientModel.findByIdAndDelete(_id);

    return { message: `patient with ID ${_id} has been removed successfully` };
  }

  //----------------------------------Helper--------------------------------------//
  private populatePatientQuery(query: any) {
    return query.populate({ path: 'userId', select: 'fullName phoneNumber' });
  }

  private async checkPatientExists(_id: string) {
    const patient = await this.patientModel.findById(_id);
    if (!patient) {
      throw new NotFoundException(`patient with ID ${_id} not found`);
    }
    return patient;
  }
}
