import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Doctor, DoctorSchema } from '../doctors/schemas/doctor.schema';
import { UserAuth, UserAuthSchema } from '../user-auth/schemas/user-auth.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    MongooseModule.forFeature([{ name: UserAuth.name, schema: UserAuthSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule { }
