import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalRecordDto } from './create-medical_record.dto';
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateMedicalRecordDto {
    @IsOptional()
    diagnosis: string;

    @IsOptional()
    note: string;
}
