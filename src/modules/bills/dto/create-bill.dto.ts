import { IsEnum, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { BillStatus } from '../schemas/bill.schema';

export class CreateBillDto {
    @IsString()
    prescriptionId: string;

    @IsString()
    patientName: string;

    @IsNumber()
    totalPrice: number;

    @IsEnum(BillStatus)
    status?: BillStatus;

    @IsOptional()
    paymentDate?: Date;
}
