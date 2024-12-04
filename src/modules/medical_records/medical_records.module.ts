import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical_records.service';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from './schemas/medical_record.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecordsController } from './medical_records.controller';
import { DetailMedicalRecordModule } from '../detail-medical-record/detail-medical-record.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
    ]),
    DetailMedicalRecordModule
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService]
})
export class MedicalRecordsModule { }
