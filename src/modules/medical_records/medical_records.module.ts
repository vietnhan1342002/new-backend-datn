import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical_records.service';
import {
  MedicalRecord,
  MedicalRecordSchema,
} from './schemas/medical_record.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalRecordsController } from './medical_records.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
    ]),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
