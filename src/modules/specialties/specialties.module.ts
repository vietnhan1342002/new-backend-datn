import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Specialty, SpecialtySchema } from './schemas/specialty.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { S3Config } from '@/config/s3.config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
    UserAuthModule,
  ],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, {
    provide: 'S3_CLIENT',
    useFactory: () => {
      const s3ClientConfig = S3Config();
      return new S3Client(s3ClientConfig);
    }
  },],
  exports: [SpecialtiesService]
})
export class SpecialtiesModule { }
