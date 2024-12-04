import { Module } from '@nestjs/common';
import { DetailMedicalRecordService } from './detail-medical-record.service';
import { DetailMedicalRecordController } from './detail-medical-record.controller';
import { DetailMedicalRecord, DetailMedicalRecordSchema } from './schemas/detail-medical-record.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DetailMedicalRecord.name, schema: DetailMedicalRecordSchema },])
  ],
  controllers: [DetailMedicalRecordController],
  providers: [DetailMedicalRecordService],
  exports: [DetailMedicalRecordService]
})
export class DetailMedicalRecordModule { }
