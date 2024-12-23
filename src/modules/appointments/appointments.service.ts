import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Appointment, Status } from './schemas/appointment.schema';
import mongoose, { Model, Types } from 'mongoose';
import { DoctorSchedulesService } from '../doctor-schedules/doctor-schedules.service';
import { isExistHelper, paginateAndPopulate } from '@/helpers/utils';
import aqp from 'api-query-params';
import { MedicalRecordsService } from '../medical_records/medical_records.service';
import { CreateMedicalRecordDto } from '../medical_records/dto/create-medical_record.dto';
import { UpdateStatusAppointmentDto } from './dto/update-status.dto';
import { NotificationsGateway } from '@/notification.gateway';
import { MailerService } from '@nestjs-modules/mailer';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly doctorScheduleService: DoctorSchedulesService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly notificationsGateway: NotificationsGateway,
    private mailerService: MailerService
  ) { }

  // ------------------------- CREATE APPOINTMENT -------------------------
  async create(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, doctorId, doctorScheduleId } = createAppointmentDto;


    // Chuyển chuỗi thành ObjectId (Mongoose tự động chuyển khi lưu vào DB)
    const patientObjectId = new Types.ObjectId(patientId); // Chuyển chuỗi thành ObjectId
    const doctorObjectId = new Types.ObjectId(doctorId);   // Chuyển chuỗi thành ObjectId
    const doctorScheduleObjectId = new Types.ObjectId(doctorScheduleId); // Chuyển chuỗi thành ObjectId

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

      schedule.result.status = 'inactive';
      await schedule.result.save({ session });

      const appointmentDate = this.formatAppointmentDate(schedule.result);

      const [appointment] = await this.appointmentModel.create(
        [{ patientId: patientObjectId, doctorId: doctorObjectId, doctorScheduleId: doctorScheduleObjectId, appointmentDate }],
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

  async findAllStatus(query: string, status: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    // Thêm điều kiện lọc status là 'pending'
    filter.status = status;

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
  async findOne(_id: Types.ObjectId) {
    const appointment = await this.populateAppointmentQuery(
      this.appointmentModel.findById(_id),
    );
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${_id} not found`);
    }
    return { result: appointment };
  }

  //-------------------------- UPDATE STATUS -----------------------------
  async updateStatus(id: Types.ObjectId, status: UpdateStatusAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    appointment.status = status.status;
    await appointment.save();

    if (status.status === Status.CONFIRMED || status.status === Status.COMPLETED) {
      const doctorId = appointment.doctorId.toString();
      const doctor = await this.doctorsService.findOne(doctorId)
      console.log("doctor", doctor);

      const userId = doctor.userId.toString()
      console.log("userId", userId);

      const message = `Appointment date ${appointment.appointmentDate} is now ${status.status}`;
      console.log("doctorId appointment:", doctorId);

      this.notificationsGateway.sendNotificationToDoctor(userId, doctorId, message);
    }

    if (status.status === Status.CONFIRMED) {
      const existingRecord = await this.medicalRecordsService.findOneByAppointmentId(appointment._id);
      console.log("existingRecord", existingRecord);
      if (!existingRecord) {
        console.log("appointment", appointment);

        const createMedicalRecordDto: CreateMedicalRecordDto = {
          patientId: new Types.ObjectId(appointment.patientId),
          doctorId: new Types.ObjectId(appointment.doctorId),
          appointmentId: new Types.ObjectId(appointment._id),
          diagnosis: '',
          note: '',
        };

        await this.medicalRecordsService.create(createMedicalRecordDto);
      }

      // const patient = await this.patientsService.findOne(appointment.patientId.toString())
      // const email = patient.email
      // console.log("email", email);
      // await this.mailerService.sendMail({
      //   to: email,
      //   subject: 'Confirm appointment',
      //   template: './confirmAppointment',
      //   context: {
      //     appointmentDate: appointment.appointmentDate,
      //   },
      // });


      if (status.status === Status.CONFIRMED || status.status === Status.CANCELED) {
        appointment.status = status.status;
        await appointment.save();
      }

      return appointment;
    }
  }

  // ------------------------- UPDATE APPOINTMENT -------------------------
  async update(_id: Types.ObjectId, updateAppointmentDto: UpdateAppointmentDto) {
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
  async remove(id: Types.ObjectId) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const appointment = await this.appointmentModel.findById(id);
      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      const schedule = await this.doctorScheduleService.findOne(
        appointment.doctorScheduleId,
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

  async completed(id: Types.ObjectId) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const appointment = await this.appointmentModel.findById(id);
      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }
      appointment.status = Status.COMPLETED;
      await appointment.save();

      const schedule = await this.doctorScheduleService.findOne(
        appointment.doctorScheduleId,
      );

      if (schedule && schedule.result.status === 'inactive') {
        schedule.result.status = 'active';
        await schedule.result.save({ session });
      }

      await session.commitTransaction();
      return { message: `Appointment with ID ${id} has been completed` };
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
        nestedSelect: 'fullName phoneNumber',
      },
      {
        path: 'doctorId',
        select: 'userId',
        nestedPath: 'userId',
        nestedSelect: 'fullName',
      }
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

  private validateSchedule(schedule: any, doctorId: Types.ObjectId) {

    if (schedule.doctorId._id.toString() !== doctorId.toString()) {
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
