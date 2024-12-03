import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalRecordDto } from './create-medical_record.dto';
import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {
    @IsString()
    @IsOptional()
    note: string;
}
