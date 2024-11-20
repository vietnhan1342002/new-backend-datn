import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schemas/appointment.schema';
import mongoose, { Model } from 'mongoose';
import { DoctorSchedulesService } from '../doctor-schedules/doctor-schedules.service';
import { isExistHelper, paginateAndPopulate } from '@/helpers/utils';
import aqp from 'api-query-params';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,

    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    private doctorScheduleService: DoctorSchedulesService,
  ) {}

  // private async checkAppointmentExistence(
  //   doctorScheduleId: string,
  //   patientId: string,
  // ) {
  //   // Tìm lịch trình có cùng doctorId, shiftId và date
  //   const appointmentExists = await this.appointmentModel.findOne({
  //     doctorScheduleId,
  //     patientId,
  //   });

  //   // Log để kiểm tra
  //   console.log('Input:', { doctorScheduleId, patientId });
  //   console.log('Existing Schedule:', appointmentExists);

  //   if (appointmentExists) {
  //     throw new BadRequestException(
  //       `Doctor schedule for DoctorSchedule ID: ${doctorScheduleId}, Patient ID: ${patientId}`,
  //     );
  //   }
  // }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, doctorScheduleId } = createAppointmentDto;

    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      const schedule =
        await this.doctorScheduleService.findOne(doctorScheduleId);

      if (!schedule) {
        throw new NotFoundException(
          'No available schedule for this doctor on this date',
        );
      }

      if (schedule.result.status === 'inactive') {
        throw new BadRequestException(
          'This doctor schedule is no longer available.',
        );
      }

      if (schedule.result.doctorId._id.toString() !== doctorId) {
        throw new BadRequestException('Doctor ID does not match the schedule.');
      }

      schedule.result.status = 'inactive';
      await schedule.result.save({ transactionSession });

      const formattedAppointmentDate = `${schedule.result.date.toISOString().split('T')[0]} ${schedule.result.shiftId.name}`;

      const appointment = await this.appointmentModel.create(
        [
          {
            patientId,
            doctorId,
            doctorScheduleId,
            appointmentDate: formattedAppointmentDate,
          },
        ],
        { transactionSession },
      );

      await transactionSession.commitTransaction();
      return { _id: appointment[0] };
    } catch (error) {
      await transactionSession.abortTransaction();
      throw error;
    } finally {
      await transactionSession.endSession();
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const populateFields = (query) =>
      query
        .populate({
          path: 'patientId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'fullName',
          },
        })
        .populate({
          path: 'doctorId',
          select: 'userId',
          populate: {
            path: 'userId',
            select: 'fullName',
          },
        });
    const { filter, sort } = aqp(query);

    const { result, totalPages, totalItems } = await paginateAndPopulate(
      this.appointmentModel,
      {
        filter,
        sort,
        current,
        pageSize,
        populateQuery: populateFields,
      },
    );

    if (result.length === 0)
      throw new NotFoundException('No appointments available');

    return { result, totalItems, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  async remove(id: string) {
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    try {
      const appointment = await this.appointmentModel.findById(id);

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      const doctorScheduleId = appointment.doctorScheduleId;

      const schedule = await this.doctorScheduleService.findOne(
        doctorScheduleId.toString(),
      );

      // Xóa lịch hẹn
      await this.appointmentModel.findByIdAndDelete(id);

      if (schedule && schedule.result.status === 'inactive') {
        schedule.result.status = 'active';
        await schedule.result.save({ session: transactionSession });
      }

      await transactionSession.commitTransaction();
      return { message: `Appointment with ID ${id} has been removed` };
    } catch (error) {
      await transactionSession.abortTransaction();
      throw error;
    } finally {
      await transactionSession.endSession();
    }
  }
}
