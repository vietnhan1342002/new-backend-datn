import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMedicalRecordDto {
    @IsMongoId()
    @IsNotEmpty({ message: 'patientId is not empty' })
    patientId: Types.ObjectId;

    @IsMongoId()
    @IsNotEmpty({ message: 'doctorId is not empty' })
    doctorId: Types.ObjectId;

    @IsMongoId()
    @IsNotEmpty({ message: 'appointmentId is not empty' })
    appointmentId: Types.ObjectId;

    @IsString()

    diagnosis: string;

    @IsString()
    @IsOptional()
    note: string;
}
