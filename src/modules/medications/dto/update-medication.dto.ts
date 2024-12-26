import { IsString, IsOptional, IsInt, Min, IsPositive } from 'class-validator';

export class UpdateMedicationDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    usageInstructions?: string;

    @IsString()
    @IsOptional()
    sideEffects?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    quantity?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    minQuantity?: number;

    @IsInt()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    unit?: string;
}
