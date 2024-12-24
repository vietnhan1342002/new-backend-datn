import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DoctorSchedule,
  DoctorScheduleSchema,
} from './schemas/doctor-schedule.schema';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { DoctorSchedulesController } from './doctor-schedules.controller';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorSchedule.name, schema: DoctorScheduleSchema },
    ]),
    UserAuthModule,
    ScheduleModule.forRoot()
  ],
  controllers: [DoctorSchedulesController],
  providers: [DoctorSchedulesService],
  exports: [DoctorSchedulesService],
})
export class DoctorSchedulesModule { }
