import { Injectable } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { MedicalRecord } from './schemas/medical_record.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectModel(MedicalRecord.name)
    private medicalRecordModel: Model<MedicalRecord>,
  ) { }

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const { appointmentId, doctorId, patientId, diagnosis, note } = createMedicalRecordDto;

    const medical_record = await this.medicalRecordModel.create({
      appointmentId, doctorId, patientId, diagnosis, note
    });
    return { _id: medical_record.id };
  }

  findAll() {
    return `This action returns all medicalRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalRecord`;
  }

  update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto) {
    return `This action updates a #${id} medicalRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalRecord`;
  }
}
