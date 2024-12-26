import { IsNumber } from 'class-validator';

export class UpdateQuantityMedicationDto {
  @IsNumber()
  quantity: number;
}
