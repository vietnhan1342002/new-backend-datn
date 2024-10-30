import { Module } from '@nestjs/common';
import { ScheduleStatusService } from './schedule_status.service';
import { ScheduleStatusController } from './schedule_status.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleStatus, ScheduleStatusSchema } from './schemas/schedule_status.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ScheduleStatus.name, schema: ScheduleStatusSchema }])],
  controllers: [ScheduleStatusController],
  providers: [ScheduleStatusService],
})
export class ScheduleStatusModule {}
