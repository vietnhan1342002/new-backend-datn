import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    UserAuthModule,
  ],

  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
