import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';

export class CreateMedicalRecordDto {
    @IsMongoId()
    @IsNotEmpty({ message: 'patientId is not empty' })
    patientId: string;

    @IsMongoId()
    @IsNotEmpty({ message: 'doctorId is not empty' })
    doctorId: string;

    @IsMongoId()
    @IsNotEmpty({ message: 'appointmentId is not empty' })
    appointmentId: string;

    @IsString()
    @IsNotEmpty({ message: 'diagnosis is not empty' })
    diagnosis: string;

    @IsString()
    @IsOptional()
    note: string;
}
