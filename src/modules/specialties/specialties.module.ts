import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Specialty, SpecialtySchema } from './schemas/specialty.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
    UserAuthModule,
  ],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
  exports: [SpecialtiesService]
})
export class SpecialtiesModule { }
