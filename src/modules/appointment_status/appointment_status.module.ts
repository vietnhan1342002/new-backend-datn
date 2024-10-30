import { Module } from '@nestjs/common';
import { AppointmentStatusService } from './appointment_status.service';
import { AppointmentStatusController } from './appointment_status.controller';

@Module({
  controllers: [AppointmentStatusController],
  providers: [AppointmentStatusService],
})
export class AppointmentStatusModule {}
