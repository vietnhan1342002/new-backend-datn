import { Module } from '@nestjs/common';
import { PrescriptionDetailsService } from './prescription-details.service';
import { PrescriptionDetailsController } from './prescription-details.controller';
import { PrescriptionDetail, PrescriptionDetailSchema } from './schemas/prescription-detail.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicationsModule } from '../medications/medications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PrescriptionDetail.name, schema: PrescriptionDetailSchema },
    ]),
    MedicationsModule
  ],
  controllers: [PrescriptionDetailsController],
  providers: [PrescriptionDetailsService],
  exports: [PrescriptionDetailsService]
})
export class PrescriptionDetailsModule { }
