import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrescriptionDetailDto } from './dto/create-prescription-detail.dto';
import { UpdatePrescriptionDetailDto } from './dto/update-prescription-detail.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PrescriptionDetail } from './schemas/prescription-detail.schema';
import { Model, Types } from 'mongoose';
import { calculateSkip, preparePaginationFilter } from '@/helpers/utils';
import aqp from 'api-query-params';
import { MedicationsService } from '../medications/medications.service';
import { PrescriptionDetailResponseDto } from '../medications/dto/prescription-detail-response.dto';

@Injectable()
export class PrescriptionDetailsService {

  constructor(
    @InjectModel(PrescriptionDetail.name)
    private prescriptionDetailModel: Model<PrescriptionDetail>,
    private medicationsService: MedicationsService
  ) { }

  async create(createPrescriptionDetailDto: CreatePrescriptionDetailDto) {
    const { prescriptionId, medicationId, quantityPrescribed } = createPrescriptionDetailDto;

    const objMedicationId = medicationId ? new Types.ObjectId(medicationId) : null;

    const objPrescriptionId = new Types.ObjectId(prescriptionId);

    if (objMedicationId) {
      await this.checkMedicationExistsInPrescription(objPrescriptionId, objMedicationId);
    }

    if (objMedicationId) {
      await this.medicationsService.updateMedicationQuantity(medicationId, quantityPrescribed);
    }

    const prescriptionDetail = await this.prescriptionDetailModel.create({
      prescriptionId: objPrescriptionId,
      medicationId: objMedicationId,
      quantityPrescribed,
    });

    return { _id: prescriptionDetail._id };
  }

  async findMedicationsByPrescriptionId(prescriptionId: Types.ObjectId) {

    const prescriptionDetails = await this.prescriptionDetailModel
      .find({ prescriptionId: new Types.ObjectId(prescriptionId) })
      .select('_id prescriptionId quantityPrescribed')
      .populate('medicationId', 'name description sideEffects usageInstructions price unit');

    if (!prescriptionDetails || prescriptionDetails.length === 0) {
      throw new NotFoundException(`No medications found for prescription ID ${prescriptionId}`);
    }

    return prescriptionDetails;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    filter.isDeleted = filter.isDeleted !== undefined ? filter.isDeleted : false;

    const skip = calculateSkip(current, pageSize);
    const limit = pageSize;

    try {
      const result = await this.prescriptionDetailModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort(sort as any);

      if (result.length === 0) {
        throw new NotFoundException('No prescriptions available');
      }

      const prescriptionDetailsResponse = result.map(detail => new PrescriptionDetailResponseDto({
        _id: detail._id,
        prescriptionId: detail.prescriptionId,
        medicationId: detail.medicationId,
        quantityPrescribed: detail.quantityPrescribed,
      }));

      const { totalItems, totalPages } = await preparePaginationFilter(
        this.prescriptionDetailModel,
        filter,
        current,
        pageSize,
      );

      return {
        result: prescriptionDetailsResponse,
        totalItems,
        totalPages,
      };

    } catch (error) {
      throw new BadRequestException(`Error fetching data: ${error.message}`);
    }
  }

  async findOne(_id: Types.ObjectId) {
    const prescriptionDetail = await this.prescriptionDetailModel.findById(_id).exec();

    if (!prescriptionDetail) {
      throw new NotFoundException(`Prescription detail with ID ${_id} not found`);
    }

    return {
      _id: prescriptionDetail._id,
      prescriptionId: prescriptionDetail.prescriptionId,
      medicationId: prescriptionDetail.medicationId,
      quantityPrescribed: prescriptionDetail.quantityPrescribed,
    };
  }

  async update(
    _id: Types.ObjectId,
    updatePrescriptionDetailDto: UpdatePrescriptionDetailDto,
  ) {

    const { quantityPrescribed } = updatePrescriptionDetailDto;

    const existingPrescriptionDetail = await this.prescriptionDetailModel.findById(_id).exec();
    if (!existingPrescriptionDetail) {
      throw new NotFoundException(`Prescription detail with ID ${_id} not found`);
    }

    const oldQuantity = existingPrescriptionDetail.quantityPrescribed;
    const newQuantity = quantityPrescribed;
    await this.medicationsService.addMedicationQuantity(existingPrescriptionDetail.medicationId, oldQuantity)

    await this.medicationsService.updateMedicationQuantity(existingPrescriptionDetail.medicationId, newQuantity)

    const updatedPrescriptionDetail = await this.prescriptionDetailModel.findByIdAndUpdate(
      _id,
      { $set: updatePrescriptionDetailDto },
      { new: true },
    ).exec();

    if (!updatedPrescriptionDetail) {
      throw new NotFoundException(`Prescription detail with ID ${_id} not found`);
    }

    return updatedPrescriptionDetail;
  }

  async softDelete(_id: Types.ObjectId) {
    const prescriptionDetail = await this.prescriptionDetailModel.findById(_id);

    if (!prescriptionDetail) {
      throw new NotFoundException(`Prescription detail with ID ${_id} not found`);
    }

    if (prescriptionDetail.isDeleted) {
      throw new BadRequestException('This prescription detail has already been soft deleted');
    }

    prescriptionDetail.isDeleted = true;
    prescriptionDetail.deletedAt = new Date();
    await prescriptionDetail.save();

    return { message: 'Prescription detail soft deleted successfully' };
  }

  async findAllSoftDelete(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    filter.isDeleted = filter.isDeleted !== true;

    const { totalItems, totalPages } = await preparePaginationFilter(
      this.prescriptionDetailModel,
      filter,
      current,
      pageSize,
    );

    const skip = calculateSkip(current, pageSize);

    const result = this.prescriptionDetailModel
      .find(filter)
      .select("_id detailMedicalRecordId")
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)

    if (!result) {
      throw new NotFoundException('No prescriptions found');
    }

    return { result, totalItems, totalPages };
  }

  private async checkMedicationExistsInPrescription(prescriptionId: Types.ObjectId, medicationId: Types.ObjectId) {
    const existingDetail = await this.prescriptionDetailModel.findOne({
      prescriptionId,
      medicationId,
    });

    if (existingDetail) {
      const medication = await this.medicationsService.findOne(medicationId);
      throw new BadRequestException(
        `Medication "${medication.name}" already exists in this prescription`,
      );
    }
  }
}
