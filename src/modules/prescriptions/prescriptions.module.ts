import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prescription, PrescriptionSchema } from './schemas/prescription.schema';
import { PrescriptionDetailsModule } from '../prescription-details/prescription-details.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
    PrescriptionDetailsModule
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService]
})
export class PrescriptionsModule { }
