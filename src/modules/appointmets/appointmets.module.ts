import { Module } from '@nestjs/common';
import { AppointmetsService } from './appointmets.service';
import { AppointmetsController } from './appointmets.controller';
import { Appointment, AppointmentSchema } from './schemas/appointmet.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }])],
  controllers: [AppointmetsController],
  providers: [AppointmetsService],
})
export class AppointmetsModule {}
