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
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly doctorScheduleService: DoctorSchedulesService,
  ) {}

  // ------------------------- CREATE APPOINTMENT -------------------------
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, doctorScheduleId } = createAppointmentDto;

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const schedule =
        await this.doctorScheduleService.findOne(doctorScheduleId);
      if (!schedule) {
        throw new NotFoundException(
          'No available schedule for this doctor on this date',
        );
      }

      this.validateSchedule(schedule.result, doctorId);

      // Mark schedule as inactive
      schedule.result.status = 'inactive';
      await schedule.result.save({ session });

      // Format appointment date
      const appointmentDate = this.formatAppointmentDate(schedule.result);

      // Create appointment
      const [appointment] = await this.appointmentModel.create(
        [{ patientId, doctorId, doctorScheduleId, appointmentDate }],
        { session },
      );

      await session.commitTransaction();
      return { _id: appointment._id };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ------------------------- FIND ALL APPOINTMENTS -------------------------
  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    const { result, totalPages, totalItems } = await paginateAndPopulate(
      this.appointmentModel,
      {
        filter,
        sort,
        current,
        pageSize,
        populateQuery: this.populateAppointmentQuery,
      },
    );

    if (result.length === 0) {
      throw new NotFoundException('No appointments available');
    }

    return { result, totalItems, totalPages };
  }

  // ------------------------- FIND ONE APPOINTMENT -------------------------
  async findOne(_id: string) {
    const appointment = await this.populateAppointmentQuery(
      this.appointmentModel.findById(_id),
    );
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${_id} not found`);
    }
    return { result: appointment };
  }

  // ------------------------- UPDATE APPOINTMENT -------------------------
  async update(_id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(_id);
    const { patientId, doctorId, doctorScheduleId, reason, status } =
      updateAppointmentDto;

    if (doctorScheduleId) {
      const schedule =
        await this.doctorScheduleService.findOne(doctorScheduleId);
      if (!schedule) {
        throw new NotFoundException(
          'No available schedule for this doctor on this date',
        );
      }
      await this.validateSchedule(schedule.result, doctorId);
    }

    // Prepare update data with only provided fields
    const updateData = this.prepareUpdateData(updateAppointmentDto);

    // Update appointment with the filtered data
    return await this.appointmentModel.updateOne({ _id }, { $set: updateData });
  }

  // ------------------------- REMOVE APPOINTMENT -------------------------
  async remove(id: string) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const appointment = await this.appointmentModel.findById(id);
      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      const schedule = await this.doctorScheduleService.findOne(
        appointment.doctorScheduleId.toString(),
      );
      await this.appointmentModel.findByIdAndDelete(id);

      if (schedule && schedule.result.status === 'inactive') {
        schedule.result.status = 'active';
        await schedule.result.save({ session });
      }

      await session.commitTransaction();
      return { message: `Appointment with ID ${id} has been removed` };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ------------------------- HELPERS -------------------------

  private populateAppointmentQuery = (query: any) => {
    const fields = [
      {
        path: 'patientId',
        select: 'userId',
        nestedPath: 'userId',
        nestedSelect: 'fullName',
      },
      {
        path: 'doctorId',
        select: 'userId',
        nestedPath: 'userId',
        nestedSelect: 'fullName',
      },
    ];
    return this.populateFieldsForQuery(query, fields);
  };

  private populateFieldsForQuery(
    query: any,
    fields: {
      path: string;
      select: string;
      nestedPath: string;
      nestedSelect: string;
    }[],
  ) {
    fields.forEach((field) => {
      query.populate({
        path: field.path,
        select: field.select,
        populate: { path: field.nestedPath, select: field.nestedSelect },
      });
    });
    return query;
  }

  private validateSchedule(schedule: any, doctorId: string) {
    if (schedule.doctorId._id.toString() !== doctorId) {
      throw new BadRequestException('Doctor ID does not match the schedule.');
    }
    if (schedule.status === 'inactive') {
      throw new BadRequestException(
        'This doctor schedule is no longer available.',
      );
    }
  }

  private formatAppointmentDate(schedule: any): string {
    const date = schedule.date.toISOString().split('T')[0];
    const shiftName = schedule.shiftId.name;
    return `${date} ${shiftName}`;
  }

  private prepareUpdateData(updateAppointmentDto: UpdateAppointmentDto) {
    const updateData: any = {};
    const { patientId, doctorId, doctorScheduleId, reason, status } =
      updateAppointmentDto;

    if (patientId) updateData.patientId = patientId;
    if (doctorId) updateData.doctorId = doctorId;
    if (doctorScheduleId) updateData.doctorScheduleId = doctorScheduleId;
    if (reason) updateData.reason = reason;
    if (status) updateData.status = status;

    return updateData;
  }
}
