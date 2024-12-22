import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from './schemas/doctor.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { S3Config } from '@/config/s3.config';
import { S3Client } from '@aws-sdk/client-s3';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    UserAuthModule,
    ScheduleModule.forRoot()
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService,
    {
      provide: 'S3_CLIENT',
      useFactory: () => {
        const s3ClientConfig = S3Config();
        return new S3Client(s3ClientConfig);
      }
    },
  ],
  exports: [DoctorsService],
})
export class DoctorsModule { }
