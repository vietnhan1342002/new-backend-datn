import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSchedule, DoctorScheduleSchema } from '../doctor-schedules/schemas/doctor-schedule.schema';
import { Specialty, SpecialtySchema } from '../specialties/schemas/specialty.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
  ],
  controllers: [FilterController],
  providers: [FilterService],
  exports: [FilterService]
})
export class FilterModule { }
